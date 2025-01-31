// Function to fetch the current dollar value
async function fetchExchangeRate() {
    const apiUrl = "https://economia.awesomeapi.com.br/json/last/USD-BRL";

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        const rate = parseFloat(data.USDBRL.bid);

        if (isNaN(rate)) {
            throw new Error("Taxa de câmbio inválida");
        }

        return rate;
    } catch (error) {
        document.getElementById("exchange-rate").textContent = "Erro ao carregar cotação";
        document.getElementById("exchange-rate").classList.add("error");
        return null;
    }
}

function formatCurrency(value, currency) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function validateDecimals(input) {
    const value = input.value;

    if (value.includes(',')) {
        const [integer, decimals] = value.split(',');
        // Strictly limit to 2 decimal places
        input.value = `${integer},${decimals.slice(0, 2)}`;
    }
}

async function calculateDollar() {
    const inputElement = document.getElementById("brl-input");
    const resultElement = document.getElementById("result");

    // Ensure proper decimal format before calculation
    validateDecimals(inputElement);

    // Convert comma to dot for calculation
    const value = parseFloat(inputElement.value.replace(',', '.'));

    if (!value || value <= 0) {
        resultElement.textContent = "Por favor, digite um valor válido";
        resultElement.classList.add("error");
        return;
    }

    const exchangeRate = await fetchExchangeRate();
    if (exchangeRate === null) return;

    const dollarValue = value / exchangeRate;

    resultElement.innerHTML = `
        <div class="result-value">
            ${formatCurrency(value, 'BRL')} = ${formatCurrency(dollarValue, 'USD')}
        </div>
    `;
    resultElement.classList.remove("error");
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const rate = await fetchExchangeRate();
        if (rate !== null) {
            document.getElementById("exchange-rate").textContent =
                formatCurrency(rate, 'BRL');
        }
    } catch (error) {
        document.getElementById("exchange-rate").textContent =
            "Erro ao carregar dados";
    }

    const inputElement = document.getElementById('brl-input');

    // Set initial value
    inputElement.value = '';

    // Handle input changes
    inputElement.addEventListener('input', (e) => {
        validateDecimals(e.target);
    });

    // Handle keypress
    inputElement.addEventListener('keypress', (e) => {
        // Block if trying to add more than 2 decimal places
        if (e.target.value.includes(',')) {
            const [, decimals] = e.target.value.split(',');
            if (decimals && decimals.length >= 2 &&
                e.target.selectionStart > e.target.value.indexOf(',')) {
                e.preventDefault();
                return;
            }
        }

        // Allow only numbers, comma, and control keys
        if (!/[\d,]/.test(e.key) && !['Enter', 'Backspace', 'Delete', 'Tab'].includes(e.key)) {
            e.preventDefault();
            return;
        }

        // Prevent multiple commas
        if (e.key === ',' && e.target.value.includes(',')) {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            calculateDollar();
        }
    });

    document.getElementById('calculate-btn').addEventListener('click', calculateDollar);
}); 