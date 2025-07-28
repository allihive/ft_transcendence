NAME := transcendence

all: $(NAME)

$(NAME):
	@docker compose -p $(NAME) up --build

up: $(NAME)

down:
	@docker compose -p $(NAME) down

clean:
	@docker compose -p $(NAME) down --rmi all -v

fclean: clean
	@rm -rf $(DATA_DIR)

re: fclean $(NAME)

.PHONY: all up down clean fclean re