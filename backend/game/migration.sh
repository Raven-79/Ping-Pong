
sleep 10
python ./game/manage.py makemigrations
python ./game/manage.py makemigrations my_shared_models
python ./game/manage.py makemigrations game
python ./game/manage.py migrate
python ./game/manage.py runserver 0.0.0.0:8000
