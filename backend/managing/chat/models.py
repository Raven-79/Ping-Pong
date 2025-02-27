from django.db import models
from my_shared_models.models import User

# Create your models here.
class Chat(models.Model):
    
    fromUser = models.ForeignKey(User, db_index=True,on_delete=models.SET_NULL, null=True,related_name="fromuser")
    toUser = models.ForeignKey(User, db_index=True,on_delete=models.SET_NULL, null=True,related_name="toUser")
    createdAt = models.DateTimeField(auto_now_add=True)#this variable is used to know when the chat was created
    updatedAt = models.DateTimeField(auto_now=True)#this variable is used to know when the last message was sent
    #this is used to make sure that there is only one chat between two users

    def other_user(self, current_user):
        return self.toUser if self.fromUser == current_user else self.fromUser

    def last_message(self):
        return self.message_set.order_by('-createdAt').first()
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['fromUser', 'toUser'],
                name="unique_chat_between_users",
                condition=models.Q(fromUser__lt=models.F('toUser'))  # Ensure the ordering is consistent
            )
        ]

    def __str__(self):
       return f'{self.fromUser} - {self.toUser}'#this is used to show the chat in the admin panel

class Message(models.Model):
    refChat = models.ForeignKey(Chat, db_index=True,on_delete=models.CASCADE)#this is used to know to which chat the message belongs
    message = models.TextField()
    msg_type = (
        (0, "TEXT"),
        (1, "INVITATION"),
        (2, "WARNING"),
    )
    type = models.IntegerField(choices=msg_type, default=0)
    #this is used to know to which game the invitation belongs
    invitation = models.ForeignKey('my_shared_models.GameInvitation', db_index=True,on_delete=models.SET_NULL, null=True, blank=True)
    author = models.ForeignKey(User, db_index=True,related_name='author',on_delete=models.SET_NULL,null=True)
    isRead = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)#this variable is used to know when the message was sent
    updatedAt = models.DateTimeField(auto_now=True)#this variable is used to know when the message was updated

    def __str__(self):
        return f'{self.refChat} - {self.author} - {self.message}'#this is used to show the message in the admin panel