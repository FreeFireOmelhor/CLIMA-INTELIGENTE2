import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env para o ambiente
load_dotenv()

# Agora você pode pegar a chave usando os.getenv()
api_key = os.getenv("b4844eae6f90c04e603ddf90fe2d7485")

if not api_key:
    print("Erro: A chave da API não foi encontrada. Verifique seu arquivo .env")
else:
    print(f"A chave da API foi carregada com sucesso! ✨")
    # print(f"Sua chave é: {api_key}") # Descomente para testar, mas não deixe em produção!

# Agora pode usar a variável 'api_key' para fazer suas chamadas de API