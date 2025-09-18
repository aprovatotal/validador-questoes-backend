import { PrismaClient } from '@prisma/client';

import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Verificar se as disciplinas já existem
  const disciplinesCount = await prisma.discipline.count();
  if (disciplinesCount === 0) {
    console.log('📚 Creating disciplines...');
    await prisma.discipline.createMany({
      data: [
        { slug: 'mathematics', name: 'Matemática' , externalId: '5b2186ec9c5aa43084ff7d1c'},
        { slug: 'portuguese', name: 'Português' , externalId: '5fe9d27935e60c598a36ba7a'},
        { slug: 'biology', name: 'Biologia' , externalId: '5b2186ec9c5aa43084ff7d1a'},
        { slug: 'geography', name: 'Geografia' , externalId: '5fe9d2a035e60c598a36ba7d'},
        { slug: 'history', name: 'História' , externalId: '5fe9d27135e60c598a36ba79'},
        { slug: 'chemistry', name: 'Química' , externalId: '5b2186ec9c5aa43084ff7d18'},
        { slug: 'physics', name: 'Física' , externalId: '5b2186ec9c5aa43084ff7d19'},
      ],
    });
    console.log('✅ Disciplines created!');
  } else {
    console.log('📚 Disciplines already exist, skipping...');
  }

  // Buscar disciplinas para usar nos usuários
  const disciplines = await prisma.discipline.findMany();

  // Verificar se já existem usuários
  const usersCount = await prisma.appUser.count();
  if (usersCount === 0) {
    console.log('👥 Creating users...');

    // Admin user
    const adminUser = await prisma.appUser.create({
      data: {
        name: 'Admin Sistema',
        email: 'admin@validador.com',
        passwordHash: await argon2.hash('admin123'),
        role: 'ADMIN',
        userDisciplines: {
          create: disciplines.map(d => ({ disciplineId: d.id })),
        },
      },
    });

    // Reviewer de Matemática
    const mathReviewer = await prisma.appUser.create({
      data: {
        name: 'Carlos Matemático',
        email: 'carlos@validador.com',
        passwordHash: await argon2.hash('carlos123'),
        role: 'REVIEWER',
        userDisciplines: {
          create: [
            { disciplineId: disciplines.find(d => d.slug === 'mathematics')?.id || BigInt(1) },
            { disciplineId: disciplines.find(d => d.slug === 'physics')?.id || BigInt(7) },
          ],
        },
      },
    });

    // Editor de Português
    const portugueseEditor = await prisma.appUser.create({
      data: {
        name: 'Ana Portuguesa',
        email: 'ana@validador.com',
        passwordHash: await argon2.hash('ana123'),
        role: 'EDITOR',
        userDisciplines: {
          create: [
            { disciplineId: disciplines.find(d => d.slug === 'portuguese')?.id || BigInt(2) },
            { disciplineId: disciplines.find(d => d.slug === 'history')?.id || BigInt(5) },
          ],
        },
      },
    });

    // User comum de Biologia
    const biologyUser = await prisma.appUser.create({
      data: {
        name: 'João Biólogo',
        email: 'joao@validador.com',
        passwordHash: await argon2.hash('joao123'),
        role: 'USER',
        userDisciplines: {
          create: [
            { disciplineId: disciplines.find(d => d.slug === 'biology')?.id || BigInt(3) },
            { disciplineId: disciplines.find(d => d.slug === 'chemistry')?.id || BigInt(6) },
          ],
        },
      },
    });

    console.log('✅ Users created!');
    console.log('📝 Login credentials:');
    console.log('  Admin: admin@validador.com / admin123');
    console.log('  Reviewer: carlos@validador.com / carlos123');
    console.log('  Editor: ana@validador.com / ana123');
    console.log('  User: joao@validador.com / joao123');

    // Criar questões de exemplo
    console.log('📝 Creating sample questions...');

    const mathDiscipline = disciplines.find(d => d.slug === 'mathematics') || disciplines[0];
    const portugueseDiscipline = disciplines.find(d => d.slug === 'portuguese') || disciplines[1];
    const biologyDiscipline = disciplines.find(d => d.slug === 'biology') || disciplines[2];

    // Questão de Matemática (aprovada)
    const mathQuestion = await prisma.question.create({
      data: {
        externalid: 'MAT001',
        statement: 'Qual é o resultado de 15 + 27?',
        competence: 'Resolver problemas de adição',
        skill: 'Operações básicas com números naturais',
        examArea: 'mt',
        subject: 'Aritmética',
        disciplineId: mathDiscipline.id,
        topic: 'Adição de números naturais',
        interpretation: 'Questão simples de adição de dois números de duas casas decimais.',
        strategies: 'Soma direta; Decomposição; Contagem',
        distractors: '1 - Erro de cálculo simples; 2 - Confusão com subtração; 3 - Troca de algarismos',
        approved: true,
        approvedAt: new Date(),
        approvedByUserUuid: mathReviewer.uuid,
        alternatives: {
          create: [
            { text: '42', order: 1, correct: true },
            { text: '32', order: 2, correct: false },
            { text: '52', order: 3, correct: false },
            { text: '41', order: 4, correct: false },
          ],
        },
      },
    });

    // Questão de Matemática (não aprovada)
    await prisma.question.create({
      data: {
        externalid: 'MAT002',
        statement: 'Se um triângulo tem ângulos de 60°, 60° e x°, qual é o valor de x?',
        competence: 'Compreender propriedades de figuras geométricas',
        skill: 'Soma dos ângulos internos de triângulos',
        examArea: 'mt',
        subject: 'Geometria',
        disciplineId: mathDiscipline.id,
        topic: 'Triângulos e ângulos',
        interpretation: 'Questão sobre propriedade fundamental dos triângulos.',
        strategies: 'Aplicar regra da soma dos ângulos internos (180°); Identificar triângulo equilátero',
        distractors: 'Valores que não completam 180°; Confusão com outros tipos de ângulos',
        alternatives: {
          create: [
            { text: '30°', order: 1, correct: false },
            { text: '60°', order: 2, correct: true },
            { text: '90°', order: 3, correct: false },
            { text: '120°', order: 4, correct: false },
          ],
        },
      },
    });

    // Questão de Português
    await prisma.question.create({
      data: {
        externalid: 'POR001',
        statement: 'Qual alternativa apresenta CORRETAMENTE a separação silábica da palavra "construção"?',
        competence: 'Dominar convenções da escrita',
        skill: 'Separação silábica',
        examArea: 'lc',
        subject: 'Fonética',
        disciplineId: portugueseDiscipline.id,
        topic: 'Divisão silábica',
        interpretation: 'Questão sobre divisão silábica de palavra com dificuldade específica.',
        strategies: 'Identificar encontros consonantais; Conhecer regras de divisão silábica',
        distractors: 'Separações incorretas comuns em palavras com encontros consonantais',
        approved: true,
        approvedAt: new Date(),
        approvedByUserUuid: portugueseEditor.uuid,
        alternatives: {
          create: [
            { text: 'cons-tru-ção', order: 1, correct: false },
            { text: 'const-ru-ção', order: 2, correct: false },
            { text: 'co-nstru-ção', order: 3, correct: false },
            { text: 'cons-tru-ção', order: 4, correct: true },
          ],
        },
      },
    });

    // Questão de Biologia
    await prisma.question.create({
      data: {
        externalid: 'BIO001',
        statement: 'Qual é a principal função dos ribossomos na célula?',
        competence: 'Compreender processos celulares',
        skill: 'Identificar organelas e suas funções',
        examArea: 'cn',
        subject: 'Citologia',
        disciplineId: biologyDiscipline.id,
        topic: 'Organelas celulares',
        interpretation: 'Questão sobre função específica de organela celular.',
        strategies: 'Relembrar funções das organelas; Associar estrutura com função',
        distractors: 'Funções de outras organelas (mitocôndria, lisossomo, retículo)',
        alternatives: {
          create: [
            { text: 'Produção de energia (ATP)', order: 1, correct: false },
            { text: 'Síntese de proteínas', order: 2, correct: true },
            { text: 'Digestão celular', order: 3, correct: false },
            { text: 'Armazenamento de substâncias', order: 4, correct: false },
          ],
        },
      },
    });

    // Questão adicional de Química
    const chemistryDiscipline = disciplines.find(d => d.slug === 'chemistry') || disciplines[5];
    await prisma.question.create({
      data: {
        externalid: 'QUI001',
        statement: 'Qual é a fórmula molecular da água?',
        competence: 'Compreender fórmulas químicas',
        skill: 'Identificar fórmulas moleculares básicas',
        examArea: 'cn',
        subject: 'Química Geral',
        disciplineId: chemistryDiscipline.id,
        topic: 'Fórmulas moleculares',
        interpretation: 'Questão básica sobre fórmula molecular de substância essencial.',
        strategies: 'Lembrar composição atômica da água; Conhecer símbolos químicos',
        distractors: 'Fórmulas de outras substâncias comuns',
        alternatives: {
          create: [
            { text: 'H2O', order: 1, correct: true },
            { text: 'CO2', order: 2, correct: false },
            { text: 'NaCl', order: 3, correct: false },
            { text: 'O2', order: 4, correct: false },
          ],
        },
      },
    });

    // Questão adicional de História
    const historyDiscipline = disciplines.find(d => d.slug === 'history') || disciplines[4];
    await prisma.question.create({
      data: {
        externalid: 'HIS001',
        statement: 'Em que ano foi proclamada a Independência do Brasil?',
        competence: 'Compreender marcos históricos',
        skill: 'Identificar datas importantes da história brasileira',
        examArea: 'ch',
        subject: 'História do Brasil',
        disciplineId: historyDiscipline.id,
        topic: 'Brasil Independente',
        interpretation: 'Questão sobre marco fundamental da história brasileira.',
        strategies: 'Conhecer cronologia da história do Brasil; Associar eventos e datas',
        distractors: 'Datas de outros eventos importantes da história brasileira',
        alternatives: {
          create: [
            { text: '1822', order: 1, correct: true },
            { text: '1889', order: 2, correct: false },
            { text: '1888', order: 3, correct: false },
            { text: '1824', order: 4, correct: false },
          ],
        },
      },
    });

    console.log('✅ Sample questions created!');
  } else {
    console.log('👥 Users already exist, skipping seed...');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });