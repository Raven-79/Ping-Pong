all :
	docker compose -f docker-compose.yml up # --build 
clean :
	docker compose -f docker-compose.yml down -v ;
fclean : clean
	docker compose -f docker-compose.yml ;
	docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f ft_transcendencemain-game_service ;docker rmi -f ft_transcendencemain-manage_service ;docker rmi -f ft_transcendencemain-auth_service;
	docker rmi nginx:1test final-manage_service:latest final-auth_service:latest final-game_service:latest ;
	docker rmi $(docker images -q);
	docker volume rm $(docker volume ls -q); docker network rm $(docker network ls -q) ;
	docker system prune -af ;

re : clean all
