import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RevealDirective } from '../../shared/animations/reveal.directive';
import { SignalBars } from './signal-bars';

interface Pillar {
  name: string;
  desc: string;
  icon: string;
}

interface Product {
  name: string;
  tag: string;
  desc: string;
  icon: string;
  modules?: string[];
}

interface Service {
  name: string;
  desc: string;
  icon: string;
}

interface Step {
  step: string;
  title: string;
  desc: string;
  icon: string;
}

@Component({
  imports: [NgIcon, RevealDirective, RouterLink, SignalBars],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  protected readonly year = new Date().getFullYear();

  protected readonly pillars: Pillar[] = [
    { name: 'Infra', desc: 'Provisionamento e operação da infraestrutura: Kubernetes, banco, storage e rede.', icon: 'lucideServer' },
    { name: 'Sec', desc: 'TLS, segredos, autenticação, atualizações e conformidade por padrão.', icon: 'lucideShieldCheck' },
    { name: 'Conf', desc: 'Configuração e customização de cada ferramenta para o seu contexto.', icon: 'lucideSlidersHorizontal' },
    { name: 'Sup', desc: 'Suporte contínuo e evolução das ferramentas ao longo do tempo.', icon: 'lucideHeadset' },
  ];

  protected readonly products: Product[] = [
    { name: 'Odoo', tag: 'ERP', desc: 'Vendas, estoque, CRM e financeiro integrados em um único sistema.', icon: 'lucideBoxes', modules: ['Vendas', 'CRM', 'Estoque', 'Faturamento', 'Compras', 'E-commerce', 'Projeto'] },
    { name: 'Documenso', tag: 'Assinatura digital', desc: 'Assine contratos em minutos, com validade jurídica e sem papel.', icon: 'lucideFileCheck', modules: ['Fluxos de assinatura', 'Modelos', 'Validade jurídica', 'API'] },
    { name: 'Stalwart Mail Server', tag: 'E-mail', desc: 'E-mail profissional, seguro e sob o seu controle.', icon: 'lucideHardDrive', modules: ['SMTP · IMAP · JMAP', 'Anti-spam', 'Criptografia', 'MFA'] },
    { name: 'n8n', tag: 'Automação', desc: 'Automatize o repetitivo e conecte toda a sua operação.', icon: 'lucideWorkflow', modules: ['Workflows visuais', '400+ integrações', 'Webhooks', 'IA'] },
    { name: 'Nextcloud', tag: 'Colaboração', desc: 'Arquivos, agenda e contatos do time, sincronizados e sob controle.', icon: 'lucideCloud', modules: ['Arquivos', 'Agenda', 'Contatos', 'Compartilhamento'] },
    { name: 'Paperless-ngx', tag: 'Documentos', desc: 'Digitalize e encontre qualquer documento em segundos.', icon: 'lucideScanText', modules: ['OCR', 'Busca full-text', 'Tags', 'Importação automática'] },
    { name: 'Zammad', tag: 'Suporte', desc: 'Atenda mais rápido com uma central de suporte organizada.', icon: 'lucideHeadset', modules: ['Multicanal', 'Base de conhecimento', 'SLA', 'Relatórios'] },
    { name: 'Metabase', tag: 'BI', desc: 'Decisões baseadas em dados, com relatórios e dashboards.', icon: 'lucideBarChart3', modules: ['Dashboards', 'Consultas SQL', 'Alertas', 'Compartilhamento'] },
    { name: 'Outline', tag: 'Wiki', desc: 'Documente processos e mantenha o time na mesma página.', icon: 'lucideBookOpen', modules: ['Docs em tempo real', 'Busca', 'Permissões', 'Comentários'] },
    { name: 'Cal.com', tag: 'Agendamento', desc: 'Reuniões agendadas sem troca de e-mails.', icon: 'lucideCalendarClock', modules: ['Página de reserva', 'Agenda integrada', 'Lembretes', 'Pagamentos'] },
    { name: 'Penpot', tag: 'Design', desc: 'Crie e prototipe interfaces em equipe, direto no navegador.', icon: 'lucideMousePointerClick', modules: ['UI Design', 'Prototipagem', 'Tempo real', 'Componentes'] },
  ];

  protected readonly services: Service[] = [
    { name: 'Autenticação SSO', desc: 'Login único (SSO/OIDC) para todas as aplicações.', icon: 'lucideFingerprint' },
    { name: 'Cofre de segredos', desc: 'Chaves, segredos e certificados com controle de acesso.', icon: 'lucideKeyRound' },
    { name: 'Certificados TLS', desc: 'Emissão e renovação automática de certificados.', icon: 'lucideShieldCheck' },
    { name: 'Banco de dados', desc: 'Banco relacional em Kubernetes, com alta disponibilidade.', icon: 'lucideDatabase' },
    { name: 'Cache e filas', desc: 'Cache e filas de alta performance para os seus serviços.', icon: 'lucideZap' },
    { name: 'Mensageria', desc: 'Comunicação confiável entre os serviços da plataforma.', icon: 'lucideMessagesSquare' },
    { name: 'API Gateway', desc: 'Roteamento, autenticação e observabilidade na borda da plataforma.', icon: 'lucideNetwork' },
    { name: 'Métricas e alertas', desc: 'Coleta de métricas e alertas para toda a plataforma.', icon: 'lucideActivity' },
    { name: 'Dashboards', desc: 'Dashboards e observabilidade em tempo real.', icon: 'lucideGauge' },
    { name: 'Logs centralizados', desc: 'Agregação e busca de logs em um só lugar.', icon: 'lucideScrollText' },
    { name: 'Disponibilidade', desc: 'Monitoramento de disponibilidade e tempo de resposta.', icon: 'lucideCloud' },
  ];

  protected readonly steps: Step[] = [
    { step: '01', title: 'Escolha a ferramenta', desc: 'Selecione no catálogo o que a sua operação precisa.', icon: 'lucideMousePointerClick' },
    { step: '02', title: 'A gente configura', desc: 'Instalamos, protegemos e customizamos para o seu contexto.', icon: 'lucideSettings2' },
    { step: '03', title: 'A gente opera', desc: 'Kubernetes, TLS, backup e atualizações ficam por nossa conta.', icon: 'lucideServer' },
    { step: '04', title: 'Você usa', desc: 'Acesso imediato, com suporte contínuo incluído.', icon: 'lucideBadgeCheck' },
  ];
}
