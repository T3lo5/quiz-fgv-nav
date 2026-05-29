#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validador e Normalizador de JSON - Quiz Pro Hub
CRIAR-04: Validação e Padronização dos Formatos JSON

Este script valida e normaliza todos os arquivos JSON da pasta simulados_pci,
garantindo que estejam no formato padrão definido no schema.
"""

import json
import os
from pathlib import Path
from datetime import datetime


class JSONValidator:
    """Validador de schema para questões do Quiz Pro Hub."""
    
    REQUIRED_FIELDS = ['enunciado', 'alternativas', 'gabarito_correto']
    OPTIONAL_FIELDS = ['id', 'comentario_ia', 'dificuldade', 'ano', 'banca', 'tags']
    VALID_ALTERNATIVE_KEYS = {'A', 'B', 'C', 'D', 'E'}
    VALID_DIFFICULTIES = {'fácil', 'médio', 'difícil'}
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.stats = {
            'total_files': 0,
            'valid_files': 0,
            'invalid_files': 0,
            'total_questions': 0,
            'questions_with_missing_fields': 0,
            'questions_normalized': 0
        }
    
    def validate_alternatives(self, alternativas, question_idx, file_path):
        """Valida o campo alternativas."""
        errors = []
        warnings = []
        
        if not isinstance(alternativas, dict):
            errors.append(f"Questão {question_idx}: 'alternativas' deve ser um objeto")
            return errors, warnings
        
        if len(alternativas) < 2:
            errors.append(f"Questão {question_idx}: 'alternativas' deve ter pelo menos 2 opções")
            return errors, warnings
        
        # Verificar chaves das alternativas
        for key in alternativas.keys():
            if key not in self.VALID_ALTERNATIVE_KEYS:
                warnings.append(f"Questão {question_idx}: Alternativa '{key}' fora do padrão (A-E)")
        
        # Verificar se as alternativas não estão vazias
        for key, value in alternativas.items():
            if not isinstance(value, str) or len(value.strip()) == 0:
                errors.append(f"Questão {question_idx}: Alternativa '{key}' está vazia ou inválida")
        
        return errors, warnings
    
    def validate_gabarito(self, gabarito, alternativas, question_idx, file_path):
        """Valida o campo gabarito_correto."""
        errors = []
        warnings = []
        
        if not isinstance(gabarito, str):
            errors.append(f"Questão {question_idx}: 'gabarito_correto' deve ser uma string")
            return errors, warnings
        
        if gabarito not in self.VALID_ALTERNATIVE_KEYS:
            errors.append(f"Questão {question_idx}: 'gabarito_correto' deve ser A, B, C, D ou E")
            return errors, warnings
        
        if alternativas and gabarito not in alternativas:
            errors.append(f"Questão {question_idx}: Gabarito '{gabarito}' não existe nas alternativas")
        
        return errors, warnings
    
    def validate_question(self, question, question_idx, file_path):
        """Valida uma questão individual."""
        errors = []
        warnings = []
        
        # Verificar campos obrigatórios
        for field in self.REQUIRED_FIELDS:
            if field not in question:
                errors.append(f"Questão {question_idx}: Campo obrigatório '{field}' ausente")
        
        # Validar enunciado
        if 'enunciado' in question:
            if not isinstance(question['enunciado'], str):
                errors.append(f"Questão {question_idx}: 'enunciado' deve ser uma string")
            elif len(question['enunciado'].strip()) < 10:
                warnings.append(f"Questão {question_idx}: 'enunciado' muito curto ({len(question['enunciado'])} chars)")
        
        # Validar alternativas
        if 'alternativas' in question:
            alt_errors, alt_warnings = self.validate_alternatives(
                question['alternativas'], question_idx, file_path
            )
            errors.extend(alt_errors)
            warnings.extend(alt_warnings)
        
        # Validar gabarito
        if 'gabarito_correto' in question:
            gab_errors, gab_warnings = self.validate_gabarito(
                question['gabarito_correto'],
                question.get('alternativas'),
                question_idx,
                file_path
            )
            errors.extend(gab_errors)
            warnings.extend(gab_warnings)
        
        # Validar campos opcionais
        if 'dificuldade' in question:
            if question['dificuldade'] not in self.VALID_DIFFICULTIES:
                warnings.append(f"Questão {question_idx}: Dificuldade '{question['dificuldade']}' não é padrão")
        
        if 'ano' in question:
            if not isinstance(question['ano'], int) or question['ano'] < 1900 or question['ano'] > 2100:
                warnings.append(f"Questão {question_idx}: Ano '{question['ano']}' fora do intervalo válido")
        
        return errors, warnings
    
    def validate_file(self, file_path):
        """Valida um arquivo JSON completo."""
        file_errors = []
        file_warnings = []
        questions = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                questions = json.loads(content)
        except json.JSONDecodeError as e:
            file_errors.append(f"Erro de parsing JSON: {str(e)}")
            return file_errors, file_warnings, []
        except UnicodeDecodeError as e:
            file_errors.append(f"Erro de encoding UTF-8: {str(e)}")
            return file_errors, file_warnings, []
        except Exception as e:
            file_errors.append(f"Erro ao ler arquivo: {str(e)}")
            return file_errors, file_warnings, []
        
        if not isinstance(questions, list):
            file_errors.append("Arquivo deve conter uma lista de questões")
            return file_errors, file_warnings, questions
        
        for idx, question in enumerate(questions, 1):
            q_errors, q_warnings = self.validate_question(question, idx, file_path)
            file_errors.extend(q_errors)
            file_warnings.extend(q_warnings)
        
        return file_errors, file_warnings, questions
    
    def normalize_question(self, question):
        """Normaliza uma questão para o formato padrão."""
        normalized = {}
        
        # Campos obrigatórios
        if 'enunciado' in question:
            normalized['enunciado'] = ' '.join(question['enunciado'].split())  # Normalizar whitespace
        
        if 'alternativas' in question and isinstance(question['alternativas'], dict):
            normalized['alternativas'] = {}
            for key, value in question['alternativas'].items():
                if key in self.VALID_ALTERNATIVE_KEYS:
                    normalized['alternativas'][key] = ' '.join(str(value).split())
        
        if 'gabarito_correto' in question:
            normalized['gabarito_correto'] = str(question['gabarito_correto']).upper().strip()
        
        # Campos opcionais
        if 'id' in question:
            normalized['id'] = str(question['id'])
        
        if 'comentario_ia' in question:
            normalized['comentario_ia'] = ' '.join(str(question['comentario_ia']).split())
        
        if 'dificuldade' in question:
            diff = str(question['dificuldade']).lower().strip()
            if diff in self.VALID_DIFFICULTIES:
                normalized['dificuldade'] = diff
        
        if 'ano' in question and isinstance(question['ano'], int):
            normalized['ano'] = question['ano']
        
        if 'banca' in question:
            normalized['banca'] = str(question['banca']).strip()
        
        if 'tags' in question and isinstance(question['tags'], list):
            normalized['tags'] = [str(tag).strip() for tag in question['tags'] if tag]
        
        return normalized
    
    def normalize_file(self, file_path, output_path=None):
        """Normaliza um arquivo JSON."""
        if output_path is None:
            output_path = file_path
        
        errors, warnings, questions = self.validate_file(file_path)
        
        if errors:
            return False, errors, warnings
        
        normalized_questions = []
        for question in questions:
            normalized = self.normalize_question(question)
            # Verificar se houve mudanças
            if json.dumps(normalized, sort_keys=True) != json.dumps(question, sort_keys=True):
                self.stats['questions_normalized'] += 1
            normalized_questions.append(normalized)
        
        # Salvar arquivo normalizado
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(normalized_questions, f, ensure_ascii=False, indent=4)
        
        return True, [], warnings


def validate_all_files(simulados_dir, report_path='validation_report.json'):
    """Valida todos os arquivos JSON na pasta simulados_pci."""
    validator = JSONValidator()
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_files': 0,
        'valid_files': 0,
        'invalid_files': 0,
        'files_with_warnings': 0,
        'problematic_files': [],
        'summary': {}
    }
    
    simulados_path = Path(simulados_dir)
    json_files = sorted(simulados_path.glob('*.json'))
    
    print(f"🔍 Iniciando validação de {len(json_files)} arquivos JSON...")
    print("=" * 60)
    
    for json_file in json_files:
        validator.stats['total_files'] += 1
        report['total_files'] += 1
        
        errors, warnings, questions = validator.validate_file(json_file)
        
        validator.stats['total_questions'] += len(questions)
        
        file_status = {
            'file': json_file.name,
            'questions_count': len(questions),
            'errors': errors,
            'warnings': warnings
        }
        
        if errors:
            validator.stats['invalid_files'] += 1
            report['invalid_files'] += 1
            report['problematic_files'].append(file_status)
            print(f"❌ {json_file.name}: {len(errors)} erro(s), {len(warnings)} aviso(s)")
        elif warnings:
            validator.stats['valid_files'] += 1
            report['valid_files'] += 1
            report['files_with_warnings'] += 1
            report['problematic_files'].append(file_status)
            print(f"⚠️  {json_file.name}: {len(warnings)} aviso(s)")
        else:
            validator.stats['valid_files'] += 1
            report['valid_files'] += 1
            print(f"✅ {json_file.name}")
    
    print("=" * 60)
    print(f"\n📊 Resumo da Validação:")
    print(f"   Total de arquivos: {report['total_files']}")
    print(f"   Arquivos válidos: {report['valid_files']}")
    print(f"   Arquivos inválidos: {report['invalid_files']}")
    print(f"   Arquivos com avisos: {report['files_with_warnings']}")
    print(f"   Total de questões: {validator.stats['total_questions']}")
    
    # Salvar relatório
    report['summary'] = validator.stats
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Relatório salvo em: {report_path}")
    
    return report


def normalize_all_files(simulados_dir, backup_dir=None):
    """Normaliza todos os arquivos JSON na pasta simulados_pci."""
    validator = JSONValidator()
    
    simulados_path = Path(simulados_dir)
    
    # Criar backup apenas se especificado
    if backup_dir:
        backup_path = Path(backup_dir)
        backup_path.mkdir(exist_ok=True)
    
    json_files = sorted(simulados_path.glob('*.json'))
    
    print(f"\n🔧 Iniciando normalização de {len(json_files)} arquivos JSON...")
    print("=" * 60)
    
    normalized_count = 0
    error_count = 0
    
    for json_file in json_files:
        # Criar backup se solicitado
        if backup_dir:
            backup_file = backup_path / json_file.name
            with open(json_file, 'r', encoding='utf-8') as f:
                original_content = f.read()
            with open(backup_file, 'w', encoding='utf-8') as f:
                f.write(original_content)
        
        # Normalizar
        success, errors, warnings = validator.normalize_file(json_file)
        
        if success:
            if warnings:
                print(f"⚠️  {json_file.name}: normalizado com {len(warnings)} aviso(s)")
            else:
                print(f"✅ {json_file.name}: normalizado")
            normalized_count += 1
        else:
            print(f"❌ {json_file.name}: erro na normalização - {errors[0] if errors else 'desconhecido'}")
            error_count += 1
    
    print("=" * 60)
    print(f"\n📊 Resumo da Normalização:")
    print(f"   Arquivos normalizados: {normalized_count}")
    print(f"   Erros: {error_count}")
    if backup_dir:
        print(f"   Backup salvo em: {backup_dir}/")
    else:
        print(f"   (sem backup)")
    
    return normalized_count, error_count


if __name__ == '__main__':
    import sys
    
    simulados_dir = 'simulados_pci'
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'validate':
            validate_all_files(simulados_dir)
        elif command == 'normalize':
            normalize_all_files(simulados_dir)
        else:
            print("Comandos disponíveis: validate, normalize")
            sys.exit(1)
    else:
        # Executar ambos por padrão
        print("🚀 Quiz Pro Hub - Validação e Normalização JSON")
        print("=" * 60)
        validate_all_files(simulados_dir)
        normalize_all_files(simulados_dir)
        print("\n✨ Validação e normalização concluídas!")
