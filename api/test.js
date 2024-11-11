import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

let successRate = new Rate('successful_requests');
let responseTimes = new Trend('response_times');

export let options = {
  stages: [
    { duration: '30s', target: 10 },  
    { duration: '1m', target: 10 }, 
    { duration: '30s', target: 0 },   
  ],
  thresholds: {
    'successful_requests': ['rate>0.95'], 
    'response_times': ['p(95)<500'],   
  },
};

const BASE_URL = 'http://api:3000'; 

function generateRandomCertificate() {
  return {
    nome: `Nome ${Math.floor(Math.random() * 1000)}`,
    nacionalidade: 'Brasileira',
    estado: 'SP',
    data_nascimento: '1990-01-01',
    documento: `123456789${Math.floor(Math.random() * 1000)}`,
    data_conclusao: '2024-06-01',
    curso: 'Curso de Teste',
    carga_horaria: '40h',
    data_emissao: '2024-07-01',
    nome_assinatura: 'Assinatura Teste',
    cargo: 'Coordenador',
  };
}

let validCertificateIds = [];

export default function () {
  sleep(30);

  group('Criar Certificado', function () {
    const certificateData = generateRandomCertificate();
    const res = http.post(`${BASE_URL}/certificates`, JSON.stringify(certificateData), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'status é 201': (r) => r.status === 201,
    });

    successRate.add(res.status === 201);
    responseTimes.add(res.timings.duration);

    if (res.status === 201) {
      const certificateId = res.json('id');
      validCertificateIds.push(certificateId);
    }
  });

  group('Testar GET /certificates/:id', function () {
    if (validCertificateIds.length > 0) {
      const certificateId = validCertificateIds[Math.floor(Math.random() * validCertificateIds.length)];
      
      const res = http.get(`${BASE_URL}/certificates/${certificateId}`);
      
      check(res, {
        'status é 200': (r) => r.status === 200,
        'certificado encontrado': (r) => r.body.includes('nome'),
      });

      successRate.add(res.status === 200);  
      responseTimes.add(res.timings.duration); 
    }
  });
}
