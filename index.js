document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const primeInput = document.getElementById('prime');
    const generatorInput = document.getElementById('generator');
    const privateAInput = document.getElementById('private-a');
    const privateBInput = document.getElementById('private-b');
    
    // UI Elements
    const startBtn = document.getElementById('start-btn');
    const errorBox = document.getElementById('error-message');
    const simulationArea = document.getElementById('simulation-area');
    
    // Steps
    const stepAliceCalc = document.getElementById('step-alice-calc');
    const stepBobCalc = document.getElementById('step-bob-calc');
    const stepExchangeA = document.getElementById('step-exchange-A');
    const stepExchangeB = document.getElementById('step-exchange-B');
    const stepAliceSecret = document.getElementById('step-alice-secret');
    const stepBobSecret = document.getElementById('step-bob-secret');
    const stepSuccess = document.getElementById('step-success');

    // Mod Math Utility
    function modPow(base, exponent, modulus) {
        if (modulus === 1n) return 0n;
        let result = 1n;
        base = base % modulus;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            exponent = exponent / 2n;
            base = (base * base) % modulus;
        }
        return result;
    }

    // Checking if a BigInt is actually a prime. O(sqrt(n)) using Number if small enough
    function isPrime(num) {
        if (num <= 1n) return false;
        if (num === 2n || num === 3n) return true;
        if (num % 2n === 0n || num % 3n === 0n) return false;
        
        // If the number is too big to convert safely to JS Number, we warn user or attempt naive loop
        // MAX_SAFE_INTEGER is 9007199254740991
        let limit;
        if (num <= BigInt(Number.MAX_SAFE_INTEGER)) {
            limit = BigInt(Math.floor(Math.sqrt(Number(num))));
        } else {
            // For larger inputs in a browser simulation we cap checking dynamically or fail validation
            return false; // Force smaller primes for the web UI validation logic
        }

        for (let i = 5n; i <= limit; i += 6n) {
            if (num % i === 0n || num % (i + 2n) === 0n) return false;
        }
        return true;
    }

    function isPositiveInteger(val) {
        return /^\d+$/.test(val) && parseInt(val) > 0;
    }

    // Set DOM elements to value helper
    function setAllInnerText(selector, text) {
        document.querySelectorAll(selector).forEach(el => el.innerText = text);
    }

    // Reset UI state before starting
    function resetSimulation() {
        simulationArea.classList.add('hidden');
        stepAliceCalc.classList.add('hidden');
        stepBobCalc.classList.add('hidden');
        stepExchangeA.classList.add('hidden');
        stepExchangeB.classList.add('hidden');
        stepAliceSecret.classList.add('hidden');
        stepBobSecret.classList.add('hidden');
        stepSuccess.classList.add('hidden');
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startBtn.addEventListener('click', async () => {
        // Reset Error & Simulation Areas
        errorBox.classList.add('hidden');
        errorBox.innerText = '';
        resetSimulation();
        
        // Validation
        const pStr = primeInput.value.trim();
        const gStr = generatorInput.value.trim();
        const aStr = privateAInput.value.trim();
        const bStr = privateBInput.value.trim();

        if (!isPositiveInteger(pStr) || !isPositiveInteger(gStr) || !isPositiveInteger(aStr) || !isPositiveInteger(bStr)) {
            errorBox.innerText = 'All inputs must be non-empty positive integers.';
            errorBox.classList.remove('hidden');
            return;
        }

        const p = BigInt(pStr);
        if (p > BigInt(Number.MAX_SAFE_INTEGER)) {
            errorBox.innerText = 'For this simulation, please use a prime smaller than 9,007,199,254,740,991.';
            errorBox.classList.remove('hidden');
            return;
        }
        
        if (!isPrime(p)) {
            errorBox.innerText = `The number ${p} is not a valid prime number.`;
            errorBox.classList.remove('hidden');
            return;
        }

        const g = BigInt(gStr);
        const a = BigInt(aStr);
        const b = BigInt(bStr);

        if (g >= p) {
            errorBox.innerText = 'Generator (g) should normally be less than the Prime (p).';
            errorBox.classList.remove('hidden');
            return;
        }

        // Calculations
        const A = modPow(g, a, p);
        const B = modPow(g, b, p);
        const sA = modPow(B, a, p);
        const sB = modPow(A, b, p);

        // Fill Values in DOM
        setAllInnerText('.val-p', p.toString());
        setAllInnerText('.val-g', g.toString());
        setAllInnerText('.val-a', a.toString());
        setAllInnerText('.val-b', b.toString());
        setAllInnerText('.res-A', A.toString());
        setAllInnerText('.res-B', B.toString());
        setAllInnerText('.res-s', sA.toString()); // Safe to use sA since sA === sB

        // Start Animation Sequence Disable Buttons
        startBtn.disabled = true;
        startBtn.innerText = 'Simulating...';

        try {
            simulationArea.classList.remove('hidden');

            // Step 1: Alice & Bob compute public keys
            await sleep(500);
            stepAliceCalc.classList.remove('hidden');
            await sleep(800);
            stepBobCalc.classList.remove('hidden');

            // Step 2: Exchange
            await sleep(1500);
            stepExchangeA.classList.remove('hidden');
            await sleep(800);
            stepExchangeB.classList.remove('hidden');

            // Step 3: Shared Secret Computation
            await sleep(1500);
            stepAliceSecret.classList.remove('hidden');
            await sleep(800);
            stepBobSecret.classList.remove('hidden');

            // Success validation
            await sleep(1500);
            stepSuccess.classList.remove('hidden');

        } finally {
            // Restore button
            startBtn.disabled = false;
            startBtn.innerText = 'Restart Simulation';
        }
    });
});
