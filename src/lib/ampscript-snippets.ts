
export interface Snippet {
    id: string;
    name: string;
    description: string;
    configFields: {
        name: string;
        label: string;
        placeholder: string;
        defaultValue?: string;
    }[];
    generate: (config: Record<string, string>) => string;
}

export const snippets: Snippet[] = [
    {
        id: 'lookup-from-url',
        name: 'Buscar Dados do Cliente pela URL',
        description: 'Personaliza a página buscando dados de uma DE com base em um parâmetro na URL (ex: ?email=...).',
        configFields: [
            { name: 'deName', label: 'Nome ou Chave Externa da DE', placeholder: 'Ex: Clientes_VIP' },
            { name: 'urlParam', label: 'Parâmetro na URL', placeholder: 'Ex: email', defaultValue: 'email' },
            { name: 'lookupColumn', label: 'Coluna para Buscar na DE', placeholder: 'Ex: EmailAddress' },
            { name: 'dataToFetch', label: 'Variáveis a Buscar (separadas por vírgula)', placeholder: 'Ex: @nome=Nome, @cidade=Cidade' },
        ],
        generate: (config) => {
            const { deName, urlParam, lookupColumn, dataToFetch } = config;
            const fields = dataToFetch.split(',').map(f => f.trim());
            
            const varDeclarations = fields.map(f => f.split('=')[0]).join(', ');
            const lookups = fields.map(f => {
                const [varName, colName] = f.split('=');
                return `SET ${varName.trim()} = Lookup("${deName}", "${colName.trim()}", "${lookupColumn}", @lookupValue)`;
            }).join('\n    ');

            return `%%[
/* --- Início: Busca de Dados do Cliente --- */
VAR @lookupValue, ${varDeclarations}
SET @lookupValue = QueryParameter("${urlParam}")

IF NOT EMPTY(@lookupValue) THEN
    ${lookups}
ENDIF
/* --- Fim: Busca de Dados do Cliente --- */
]%%`;
        },
    },
    {
        id: 'lookup-rows',
        name: 'Buscar Histórico de Compras',
        description: 'Busca múltiplas linhas (ex: últimas 5 compras) de uma DE e prepara para exibição em um loop.',
        configFields: [
            { name: 'deName', label: 'Nome ou Chave da DE de Histórico', placeholder: 'Ex: Historico_Compras' },
            { name: 'lookupColumn', label: 'Coluna para Buscar na DE', placeholder: 'Ex: UserID' },
            { name: 'lookupValue', label: 'Valor para a Busca', placeholder: 'Ex: %%SubscriberKey%% ou @userID' },
            { name: 'sortColumn', label: 'Coluna para Ordenar', placeholder: 'Ex: DataCompra' },
            { name: 'sortDirection', label: 'Direção da Ordenação', placeholder: 'desc ou asc', defaultValue: 'desc' },
            { name: 'rowCount', label: 'Número de Linhas a Buscar', placeholder: 'Ex: 5', defaultValue: '5' },
        ],
        generate: (config) => {
            const { deName, lookupColumn, lookupValue, sortColumn, sortDirection, rowCount } = config;
            return `%%[
/* --- Início: Busca de Histórico --- */
VAR @rows, @rowCount
SET @rows = LookupOrderedRows("${deName}", ${rowCount}, "${sortColumn} ${sortDirection}", "${lookupColumn}", "${lookupValue}")
SET @rowCount = RowCount(@rows)
/* --- Fim: Busca de Histórico --- */

/* Exemplo de uso no HTML:
%%[ IF @rowCount > 0 THEN 
        FOR @i = 1 to @rowCount DO
            SET @row = Row(@rows, @i)
            SET @produto = Field(@row, "NomeProduto")
            SET @data = Field(@row, "DataCompra")
    ]%%
        <p>Produto: %%=v(@produto)=%%, Data: %%=v(@data)=%%</p>
    %%[ 
        NEXT @i
    ENDIF ]%%
*/
]%%`;
        },
    },
    {
        id: 'get-url-params',
        name: 'Capturar Parâmetros da URL',
        description: 'Cria variáveis AMPScript a partir de todos os parâmetros passados na URL da CloudPage.',
        configFields: [
            { name: 'paramNames', label: 'Nomes dos Parâmetros (separados por vírgula)', placeholder: 'Ex: utm_source, utm_medium, cupom' },
        ],
        generate: (config) => {
            const params = config.paramNames.split(',').map(p => p.trim());
            const varDeclarations = params.map(p => `@${p}`).join(', ');
            const sets = params.map(p => `SET @${p} = QueryParameter("${p}")`).join('\n    ');
            return `%%[
/* --- Início: Captura de Parâmetros de URL --- */
VAR ${varDeclarations}
${sets}
/* --- Fim: Captura de Parâmetros de URL --- */
]%%`;
        },
    },
    {
        id: 'conditional-content',
        name: 'Conteúdo Condicional Simples',
        description: 'Mostra ou oculta um bloco de conteúdo se uma variável tiver um valor específico.',
        configFields: [
            { name: 'variable', label: 'Variável a ser Verificada', placeholder: 'Ex: @pais' },
            { name: 'value', label: 'Valor para Comparar', placeholder: 'Ex: "Brasil"' },
        ],
        generate: (config) => {
            const { variable, value } = config;
            return `%%[
/* --- Início: Conteúdo Condicional --- */
IF ${variable} == ${value} THEN
/* --- Fim: Conteúdo Condicional --- */
]%%

    <!-- Insira seu HTML ou componentes aqui dentro -->
    <h1>Conteúdo visível apenas se a condição for verdadeira.</h1>

%%[ ENDIF ]%%`;
        }
    }
];
