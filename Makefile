SHELL := /bin/sh

AGENTS_DIR := agents
DEPLOYMENT_DIR := deployment
COMPOSE_FILE := $(DEPLOYMENT_DIR)/docker-compose.yml
ENV_FILE := $(DEPLOYMENT_DIR)/.env

.PHONY: help agents-install agents-dev agents-build agents-typecheck agents-check \
	deploy-env deploy-secrets deploy-config deploy-up deploy-down deploy-restart \
	deploy-ps deploy-logs deploy-smoke deploy-backup deploy-restore \
	deploy-local-init deploy-local-up deploy-local-proof deploy-local-info

help: ## Lista os comandos disponíveis
	@awk 'BEGIN {FS = ": ## "}; /^[a-zA-Z0-9_.-]+: ## / {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

agents-install: ## Instala dependências do workspace agents
	cd $(AGENTS_DIR) && npm install

agents-dev: ## Inicia o Mastra em modo desenvolvimento
	cd $(AGENTS_DIR) && npm run dev

agents-build: ## Gera o build do Mastra com Studio
	cd $(AGENTS_DIR) && npm run build

agents-typecheck: ## Executa o typecheck do workspace agents
	cd $(AGENTS_DIR) && npm run typecheck

agents-check: ## Executa a validação padrão do workspace agents
	cd $(AGENTS_DIR) && npm run check

deploy-env: ## Cria deployment/.env a partir do exemplo, se ainda não existir
	@if [ -f "$(ENV_FILE)" ]; then \
		echo "$(ENV_FILE) já existe"; \
	else \
		cp $(DEPLOYMENT_DIR)/.env.example $(ENV_FILE); \
		echo "$(ENV_FILE) criado"; \
	fi

deploy-local-init: ## Bootstrap local obrigatório do deploy com Traefik: cria deployment/.env e secrets de smoke se faltarem
	@mkdir -p $(DEPLOYMENT_DIR)
	@if [ ! -f "$(ENV_FILE)" ]; then \
		printf '%s\n' \
			'APP_HOST=mastra.localhost' \
			'POSTGRES_DB=agents' \
			'POSTGRES_PORT=55432' \
			'POSTGRES_USER=agents' \
			'TELEGRAM_ALLOWED_UPDATES=message' \
			'TELEGRAM_ENABLED=true' \
			'TELEGRAM_PUBLIC_BASE_URL=http://mastra.localhost' \
			'TRAEFIK_HTTP_PORT=8080' \
			> "$(ENV_FILE)"; \
		echo "$(ENV_FILE) criado com defaults locais"; \
	else \
		echo "$(ENV_FILE) preservado"; \
	fi
	@if [ ! -d "$(DEPLOYMENT_DIR)/.secrets" ]; then \
		OPENROUTER_API_KEY=$$(awk -F= '/^OPENROUTER_API_KEY=/{print substr($$0, index($$0,"=")+1)}' $(AGENTS_DIR)/.env); \
		if [ -z "$$OPENROUTER_API_KEY" ]; then \
			echo "OPENROUTER_API_KEY ausente em $(AGENTS_DIR)/.env; nao foi possivel gerar secrets locais" >&2; \
			exit 1; \
		fi; \
		$(DEPLOYMENT_DIR)/scripts/generate-secrets.sh \
			"$$OPENROUTER_API_KEY" \
			"local-basic-auth" \
			"dummy-telegram-bot-token" \
			"local-webhook-key" \
			"local-webhook-secret" \
			"admin"; \
	else \
		echo "$(DEPLOYMENT_DIR)/.secrets preservado"; \
	fi

deploy-secrets: ## Gera secrets locais. Uso: make deploy-secrets OPENROUTER_API_KEY=... BASIC_AUTH_PASSWORD=... TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_PATH_KEY=... TELEGRAM_WEBHOOK_SECRET_TOKEN=... [BASIC_AUTH_USER=admin]
	@if [ -z "$(OPENROUTER_API_KEY)" ] || [ -z "$(BASIC_AUTH_PASSWORD)" ] || [ -z "$(TELEGRAM_BOT_TOKEN)" ] || [ -z "$(TELEGRAM_WEBHOOK_PATH_KEY)" ] || [ -z "$(TELEGRAM_WEBHOOK_SECRET_TOKEN)" ]; then \
		echo "uso: make deploy-secrets OPENROUTER_API_KEY=... BASIC_AUTH_PASSWORD=... TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_PATH_KEY=... TELEGRAM_WEBHOOK_SECRET_TOKEN=... [BASIC_AUTH_USER=admin]" >&2; \
		exit 1; \
	fi
	@$(DEPLOYMENT_DIR)/scripts/generate-secrets.sh "$(OPENROUTER_API_KEY)" "$(BASIC_AUTH_PASSWORD)" "$(TELEGRAM_BOT_TOKEN)" "$(TELEGRAM_WEBHOOK_PATH_KEY)" "$(TELEGRAM_WEBHOOK_SECRET_TOKEN)" "$(if $(BASIC_AUTH_USER),$(BASIC_AUTH_USER),admin)"

deploy-config: ## Renderiza a configuração final do Docker Compose
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) config

deploy-up: ## Sobe a stack local com build
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d --build

deploy-local-up: deploy-local-init ## Bootstrap obrigatório + sobe stack local via Traefik na porta 8080
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d --build

deploy-local-info: ## Exibe URL do Chrome, login BasicAuth, configuração do Studio e acesso DBeaver
	@BASIC_AUTH_USER=$$(tr -d '\r\n' < $(DEPLOYMENT_DIR)/.secrets/traefik_username); \
	BASIC_AUTH_PASSWORD=$$(tr -d '\r\n' < $(DEPLOYMENT_DIR)/.secrets/traefik_password); \
	POSTGRES_PASSWORD=$$(tr -d '\r\n' < $(DEPLOYMENT_DIR)/.secrets/postgres_password); \
	printf '%s\n' \
		'Chrome URL: http://mastra.localhost:8080/' \
		'BasicAuth user: '"$$BASIC_AUTH_USER" \
		'BasicAuth password: '"$$BASIC_AUTH_PASSWORD" \
		'Studio Mastra instance URL: http://mastra.localhost:8080' \
		'Studio API prefix: /api' \
		'Studio headers: none' \
		'DBeaver host: 127.0.0.1' \
		'DBeaver port: 55432' \
		'DBeaver database: agents' \
		'DBeaver user: agents' \
		'DBeaver password: '"$$POSTGRES_PASSWORD"

deploy-down: ## Derruba a stack local sem remover o volume
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down

deploy-restart: ## Reinicia a stack local
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) restart

deploy-ps: ## Mostra o status dos serviços da stack
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) ps

deploy-logs: ## Exibe logs da stack. Uso opcional: make deploy-logs SERVICE=agents
	@if [ -n "$(SERVICE)" ]; then \
		docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f $(SERVICE); \
	else \
		docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f; \
	fi

deploy-smoke: ## Executa o smoke test ponta a ponta do deploy
	@$(DEPLOYMENT_DIR)/scripts/smoke-test.sh

deploy-local-proof: deploy-smoke ## Prova local obrigatória: smoke + Studio + healths via Traefik
	@BASIC_AUTH_USER=$$(tr -d '\r\n' < $(DEPLOYMENT_DIR)/.secrets/traefik_username); \
	BASIC_AUTH_PASSWORD=$$(tr -d '\r\n' < $(DEPLOYMENT_DIR)/.secrets/traefik_password); \
	STUDIO_CODE=$$(curl -s -o /tmp/mastra-studio.html -w '%{http_code}' -u "$$BASIC_AUTH_USER:$$BASIC_AUTH_PASSWORD" -H 'Host: mastra.localhost' http://127.0.0.1:8080/); \
	MARCOS_HEALTH_CODE=$$(curl -s -o /tmp/marcos-health.json -w '%{http_code}' -u "$$BASIC_AUTH_USER:$$BASIC_AUTH_PASSWORD" -H 'Host: mastra.localhost' http://127.0.0.1:8080/marcos/health); \
	KNOWLEDGE_CODE=$$(curl -s -o /tmp/marcos-knowledge.json -w '%{http_code}' -u "$$BASIC_AUTH_USER:$$BASIC_AUTH_PASSWORD" -H 'Host: mastra.localhost' http://127.0.0.1:8080/marcos/knowledge/status); \
	grep -q '<title>Mastra Studio</title>' /tmp/mastra-studio.html || { echo 'Studio nao respondeu HTML esperado' >&2; exit 1; }; \
	test "$$STUDIO_CODE" = "200" || { echo "Studio respondeu $$STUDIO_CODE" >&2; exit 1; }; \
	test "$$KNOWLEDGE_CODE" = "200" || { echo "/marcos/knowledge/status respondeu $$KNOWLEDGE_CODE" >&2; exit 1; }; \
	test "$$MARCOS_HEALTH_CODE" = "503" || { echo "/marcos/health deveria sinalizar blocker controlado e respondeu $$MARCOS_HEALTH_CODE" >&2; exit 1; }; \
	grep -q '"telegram_user_id real dos dois usuários iniciais ainda não provisionado"' /tmp/marcos-health.json || { echo '/marcos/health nao expôs o blocker esperado de allowlist local' >&2; exit 1; }; \
	echo "prova local concluida: Studio 200, knowledge 200, marcos health 503 controlado"

deploy-backup: ## Gera backup lógico do schema agents. Uso opcional: make deploy-backup FILE=deployment/backups/custom.dump
	@$(DEPLOYMENT_DIR)/scripts/backup.sh $(if $(FILE),$(FILE),)

deploy-restore: ## Restaura um dump. Uso: make deploy-restore FILE=deployment/backups/arquivo.dump
	@if [ -z "$(FILE)" ]; then \
		echo "uso: make deploy-restore FILE=deployment/backups/arquivo.dump" >&2; \
		exit 1; \
	fi
	@$(DEPLOYMENT_DIR)/scripts/restore.sh "$(FILE)"
