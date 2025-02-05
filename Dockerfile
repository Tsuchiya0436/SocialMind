# PythonのベースイメージをPython 3.11のスリム版に変更
FROM python:3.11-slim

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev build-essential pkg-config default-mysql-client procps

# 作業ディレクトリを設定
WORKDIR /app

# 必要なPythonパッケージをインストール
COPY requirements.txt /app/
RUN pip install --no-cache-dir --timeout=1000 --retries=5 -r requirements.txt

# アプリケーションのコードをコピー
COPY . /app

# ポート8000を公開
EXPOSE 8000

# Djangoアプリケーションのサーバーを起動するコマンド
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
