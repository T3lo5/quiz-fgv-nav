# Documentação do Formato JSON - Quiz Pro Hub

## Visão Geral

Este documento descreve o formato padrão esperado para os arquivos JSON de questões no Quiz Pro Hub.

## Schema Padrão

Cada arquivo JSON deve conter um **array de objetos**, onde cada objeto representa uma questão.

### Estrutura da Questão

```json
{
  "id": "string (opcional)",
  "enunciado": "string (obrigatório)",
  "alternativas": {
    "A": "string",
    "B": "string",
    "C": "string",
    "D": "string",
    "E": "string (opcional)"
  },
  "gabarito_correto": "string (obrigatório)",
  "comentario_ia": "string (opcional)",
  "dificuldade": "string (opcional)",
  "ano": "integer (opcional)",
  "banca": "string (opcional)",
  "tags": ["string"] (opcional)
}
```

## Campos Obrigatórios

### 1. `enunciado`
- **Tipo**: String
- **Descrição**: Texto completo da pergunta ou comando da questão
- **Requisitos**: Mínimo de 10 caracteres
- **Exemplo**: 
  ```json
  "enunciado": "Qual é a capital do Brasil?"
  ```

### 2. `alternativas`
- **Tipo**: Objeto
- **Descrição**: Conjunto de opções de resposta
- **Requisitos**: 
  - Deve ter pelo menos 2 alternativas
  - Chaves devem ser letras maiúsculas de A a E
  - Cada alternativa deve ter texto não vazio
- **Exemplo**:
  ```json
  "alternativas": {
    "A": "São Paulo",
    "B": "Rio de Janeiro",
    "C": "Brasília",
    "D": "Salvador"
  }
  ```

### 3. `gabarito_correto`
- **Tipo**: String
- **Descrição**: Letra da alternativa correta
- **Requisitos**: Deve ser uma das letras A, B, C, D ou E e existir nas alternativas
- **Exemplo**:
  ```json
  "gabarito_correto": "C"
  ```

## Campos Opcionais

### 4. `id`
- **Tipo**: String
- **Descrição**: Identificador único da questão
- **Exemplo**: `"id": "1234567"`

### 5. `comentario_ia`
- **Tipo**: String
- **Descrição**: Explicação ou justificativa da resposta correta
- **Exemplo**:
  ```json
  "comentario_ia": "Brasília é a capital do Brasil desde 1960, quando foi inaugurada pelo presidente Juscelino Kubitschek."
  ```

### 6. `dificuldade`
- **Tipo**: String
- **Descrição**: Nível de dificuldade da questão
- **Valores válidos**: `"fácil"`, `"médio"`, `"difícil"`
- **Exemplo**: `"dificuldade": "médio"`

### 7. `ano`
- **Tipo**: Integer
- **Descrição**: Ano de origem da questão
- **Intervalo válido**: 1900-2100
- **Exemplo**: `"ano": 2023`

### 8. `banca`
- **Tipo**: String
- **Descrição**: Banca examinadora ou instituição criadora
- **Exemplo**: `"banca": "FGV"`

### 9. `tags`
- **Tipo**: Array de strings
- **Descrição**: Palavras-chave relacionadas ao conteúdo
- **Exemplo**: `"tags": ["geografia", "brasil", "capitais"]`

## Exemplo Completo

```json
[
  {
    "id": "1234567",
    "enunciado": "Qual é a capital do Brasil?",
    "alternativas": {
      "A": "São Paulo",
      "B": "Rio de Janeiro",
      "C": "Brasília",
      "D": "Salvador",
      "E": "Fortaleza"
    },
    "gabarito_correto": "C",
    "comentario_ia": "Brasília é a capital do Brasil desde 1960.",
    "dificuldade": "fácil",
    "ano": 2023,
    "banca": "FGV",
    "tags": ["geografia", "brasil", "capitais"]
  }
]
```

## Validação

Para validar seus arquivos JSON, utilize o script `json_validator.py`:

```bash
# Apenas validar
python json_validator.py validate

# Validar e normalizar
python json_validator.py normalize
```

## Normalização Automática

O script de normalização realiza as seguintes operações:

1. **Whitespace**: Remove espaços extras e normaliza quebras de linha
2. **Gabarito**: Converte para maiúsculas (a → A)
3. **Encoding**: Garante UTF-8 correto
4. **Formatação**: Aplica indentação consistente (4 espaços)

## Erros Comuns

### ❌ Gabarito inválido
```json
{
  "alternativas": {"A": "Opção A", "B": "Opção B"},
  "gabarito_correto": "C"  // ERRO: C não existe nas alternativas
}
```

### ❌ Alternativas vazias
```json
{
  "alternativas": {"A": "Opção A", "B": ""}  // ERRO: B está vazia
}
```

### ❌ Enunciado muito curto
```json
{
  "enunciado": "Questão?"  // ERRO: menos de 10 caracteres
}
```

### ❌ Campos obrigatórios ausentes
```json
{
  "id": "123",
  "alternativas": {"A": "A", "B": "B"}
  // ERRO: faltam 'enunciado' e 'gabarito_correto'
}
```

## Ferramentas

- **Schema JSON**: `json_schema.json` - Schema formal para validação
- **Validador**: `json_validator.py` - Script Python para validação em lote
- **Relatório**: `validation_report.json` - Relatório detalhado de validação

## Contato

Para dúvidas ou sugestões sobre o formato, consulte a documentação do projeto ou abra uma issue no repositório.

---

*Última atualização: 29/05/2026*  
*Versão do schema: 1.0*
