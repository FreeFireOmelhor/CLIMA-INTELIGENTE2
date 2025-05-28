async function buscarPrevisaoDetalhada(cidade) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    resultadoDiv.innerHTML = 'Carregando...';

    try {
        const response = await fetch(`http://localhost:3001/api/previsao/${encodeURIComponent(cidade)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao buscar previsão.");
        }

        const data = await response.json();
        const previsaoProcessada = processarDadosForecast(data); // Sua função existente
        exibirPrevisaoDetalhada(previsaoProcessada, cidade);    // Sua função existente

    } catch (error) {
        resultadoDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
        // A URL AGORA APONTA PARA O SEU BACKEND
const response = await fetch(`http://localhost:3001/api/previsao/${cidade}`);
// A API KEY FOI REMOVIDA DAQUI!


}