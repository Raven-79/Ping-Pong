python3 ./managing/manage.py makemigrations my_shared_models
python3 ./managing/manage.py makemigrations tournaments
python3 ./managing/manage.py makemigrations Mapp
python3 ./managing/manage.py makemigrations chat
python3 ./managing/manage.py migrate
python3 ./managing/manage.py runserver 0.0.0.0:8001
