SHELL := /bin/sh

AGENTS_DIR := agents
DEPLOYMENT_DIR := deployment
COMPOSE_FILE := $(DEPLOYMENT_DIR)/docker-compose.yml
ENV_FILE := $(DEPLOYMENT_DIR)/.env

.PHONY: help agents-install agents-dev agents-build agents-typecheck agents-check \
	deploy-env deploy-secrets deploy-config deploy-up deploy-down deploy-restart \
	deploy-ps deploy-logs deploy-smoke deploy-backup deploy-restore

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

deploy-backup: ## Gera backup lógico do schema agents. Uso opcional: make deploy-backup FILE=deployment/backups/custom.dump
	@$(DEPLOYMENT_DIR)/scripts/backup.sh $(if $(FILE),$(FILE),)

deploy-restore: ## Restaura um dump. Uso: make deploy-restore FILE=deployment/backups/arquivo.dump
	@if [ -z "$(FILE)" ]; then \
		echo "uso: make deploy-restore FILE=deployment/backups/arquivo.dump" >&2; \
		exit 1; \
	fi
	@$(DEPLOYMENT_DIR)/scripts/restore.sh "$(FILE)"
