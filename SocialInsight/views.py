from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import QandA
from .text_generation import generate_question_and_model_answer

ATTRIBUTE_CHOICES = [
    'empathy', 'organization', 'visioning', 'influence',
    'inspiration', 'team', 'perseverance'
]

def question_view(request):
    if request.method == 'POST':
        # ユーザーの回答を取得
        user_answer = request.POST.get('user_answer')
        question_text = request.POST.get('question_text')
        model_answer = request.POST.get('model_answer')
        attribute = request.POST.get('attribute')
        
        # QandAモデルに保存
        QandA.objects.create(
            user = request.user,
            question_text = question_text,
            model_answer = model_answer,
            user_answer = user_answer,
            attribute = attribute,
            session_id = QandA.objects.filter(user = request.user).count() + 1
        )

        return redirect('question_view')

    else:
        # ユーザーにたいしてまだ出題していない属性を取得
        answered_attributes = QandA.objects.filter(user=request.user).values_list('attribute', flat=True)
        remaining_attributes = list(set(ATTRIBUTE_CHOICES) - set(answered_attributes))

        if remaining_attributes:
            attribute = remaining_attributes[0]
        else:
            attribute = random.choice(ATTRIBUTE_CHOICES)

        # 問題文を生成
        question_text, model_answer, _ = generate_question_and_model_answer(attribute)

        context = {
            'question_text': question_text,
            'model_answer': model_answer,
            'attribute': attribute
        }

        return render(request, 'SocialInsight/question_form.html', context)