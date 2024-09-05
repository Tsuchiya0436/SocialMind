from django.db import models
from django.contrib.auth.models import User

ATTRIBUTE_CHOICES = [
    ('empathy', '共感力'),
    ('organization', '組織理解'),
    ('visioning', 'ビジョニング'),
    ('influence', '影響力'),
    ('inspiration', '啓発力'),
    ('team', 'チームワーク力'),
    ('perseverance', '忍耐力'),
]

class QandA(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question_text = models.TextField()
    model_answer = models.TextField()
    user_answer = models.TextField()
    attribute = models.CharField(max_length=20, choices=ATTRIBUTE_CHOICES)
    session_id = models.IntegerField()

    def __str__(self):
        return f'{self.user.username}(第{self.session_id}回目)'

    class Meta:
        verbose_name = "Q and A"
        verbose_name_plural = "Q and A"

class Scores(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    empathy = models.IntegerField(default=0)
    organization = models.IntegerField(default=0)
    visioning = models.IntegerField(default=0)
    influence = models.IntegerField(default=0)
    inspiration = models.IntegerField(default=0)
    team = models.IntegerField(default=0)
    perseverance = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    session_id = models.IntegerField(default=0)

    @classmethod
    def create_new_score(cls, user, new_scores):
        session_id = cls.objects.filter(user=user).count() + 1
        return cls.objects.create(
            user = user,
            empathy = new_scores.get('empathy', 0),
            organization = new_scores.get('organization', 0),
            visioning = new_scores.get('visioning', 0),
            influence = new_scores.get('influence', 0),
            inspiration = new_scores.get('inspiration', 0),
            team = new_scores.get('team', 0),
            perseverance = new_scores.get('perseverance', 0),
            total = new_scores.get('total', 0),
            session_id = session_id
        )

    def __str__(self):
        return f'{self.user.username}: {self.total}({self.session_id})'

    class Meta:
        verbose_name = "Scores"
        verbose_name_plural = "Scores"

class Messages(models.Model):

    TYPE_CHOICES = [
        ('strength', '強み'),
        ('improvement', '改善点'),
    ]

    attribute = models.CharField(max_length=20, choices=ATTRIBUTE_CHOICES)
    category = models.CharField(max_length=20, choices=TYPE_CHOICES)
    strength_text = models.TextField()
    improvement_text = models.TextField()
    training_name = models.TextField()
    training_content = models.TextField()

    def __str__(self):
        return f'{self.get_attribute_display()}-{self.get_category_display()}'

    class Meta:
        verbose_name = "Messages"
        verbose_name_plural = "Messages"