# Generated by Django 5.1.1 on 2024-09-06 08:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SocialInsight', '0002_remove_messages_category_alter_messages_attribute_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='messages',
            name='improvement_text',
        ),
        migrations.RemoveField(
            model_name='messages',
            name='strength_text',
        ),
        migrations.AddField(
            model_name='messages',
            name='category',
            field=models.CharField(choices=[('strength', '強み'), ('improvement', '改善点')], default='', max_length=20),
        ),
        migrations.AddField(
            model_name='messages',
            name='message',
            field=models.TextField(default=''),
        ),
    ]
