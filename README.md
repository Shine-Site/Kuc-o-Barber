# Kucão Barber Barbearia — site e agenda

## Arquivos
- `index.html`: página, formulário de agendamento e painel administrativo.
- `style.css`: visual responsivo.
- `app.js`: horários, reservas e painel.
- `assets/logo-kucao-barber.png`: logo enviada, sem alterações.

## Testar
Abra `index.html` no navegador. Para publicar, envie todos os arquivos mantendo a estrutura de pastas.

## Painel
Acesse `seudominio.com/#admin` (ou clique em “Painel Admin” no topo).
Senha inicial: `1234`.

**Antes de publicar:** abra `app.js` e altere `ADMIN_PASSWORD`. Ajuste também `OPEN_HOUR`, `CLOSE_HOUR`, `SLOT_MINUTES` e `CLOSED_DAYS` conforme o funcionamento real.

## Limitação importante desta versão
Esta é uma versão estática de demonstração: os agendamentos ficam salvos no `localStorage` do navegador. Portanto, o cliente e o administrador só verão a mesma agenda se usarem o mesmo navegador/dispositivo. Não é adequado para receber reservas reais de vários clientes ao mesmo tempo.

Para operação real com clientes em celulares diferentes e painel centralizado, é necessário conectar um banco de dados e autenticação (por exemplo, Supabase ou Firebase) e configurar regras para impedir reservas duplicadas no servidor. GitHub Pages sozinho não fornece banco de dados nem autenticação segura.
