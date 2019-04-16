# Customer Service Rules
##### Serviço criado para: cadastrar regras de atendimento em uma clínica:
**Objetivo:** Cadastrar regras de atendimento, para gerenciamento do atendimento aos clientes de uma clínica, com intervalos de atendimentos por: dias específicos, atendimento diário e semanal

**Documentação Open API:** [https://app.swaggerhub.com/apis/mlaguardia/customer-service/1.0.0](https://app.swaggerhub.com/apis/mlaguardia/customer-service/1.0.0)

## How to use it:
* Copy `.env.example` to `.env` and change environment variables accordingly
* Run `docker-compose up --build` for development
    - Changes made to `server/` are live reloaded
    
## How to test:
* For running tests, run `npm test`
* For running tests in watch mode, run `npm run watch-test`

## Implementação:
    - Testes de Integração com Exemplo do Desafio
    - Validação de regras colidentes
    - Validação de campos
    - GraphQL externo para consumo
## Endpoints:
### GET - /customer-service/rules
Parameters:
|Name         | Type                                                          |
|-------------|--------------------------------------------------------------:|
|type         | string (query), Available values : specific_day, daily, weekly|
|specific_day | string (query), Date Format (DD-MM-YYYY)                      |
|start_time   | string (query), Time Format(HH:MM)                            |
|end_time     | string (query), Time Format(HH:MM)                            |
|rule_name    | string (query)                                                |
### POST - /customer-service/rules
Parameters:
|Name| Type | Required
|---------------------|:--------------------------------------------------------------:|---------------------------------:|
|type                 |string (body), - Available values : specific_day, daily, weekly |true                              |
|specific_day         |string (body), Date Format (DD-MM-YYYY)                         |required if type is specific_day  |
|intervals.start_time | string (body), Time Format(HH:MM)                              |true                              |
|intervals.end_time   | string (body), Time Format(HH:MM)                              |true                              |
|rule_name            | string (body), Min 3 characters                                |true                              |
### DELETE - /customer-service/rules/:id
Parameters:
|Name|Type           |Required|
|----|:-------------:|-------:|
|id  | string (path) |true    |
### GET - /customer-service/available-schedules
Parameters:
|Name       |Type                                      |Required |
|-----------|:----------------------------------------:|--------:|
|start_date | string (query), Date Format (DD-MM-YYYY) | true    |
|end_date   | string (query), Date Format (DD-MM-YYYY) | true    |
