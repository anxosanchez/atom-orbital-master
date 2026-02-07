/**
 * MATH UTILITIES FOR HYDROGEN WAVE FUNCTIONS
 * 
 * The wave function psi(r, theta, phi) = R(r) * Y(theta, phi)
 * 
 * R(r) = Radial Wave Function
 * Y(theta, phi) = Spherical Harmonics
 */

// Factorial function
export function factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// Associated Legendre Polynomials P_l^m(x)
// x = cos(theta)
export function legendre(l: number, m: number, x: number): number {
    const absM = Math.abs(m);
    if (absM > l) return 0;

    // pMM = P_m^m(x)
    let pMM = 1;
    // Wait, double factorial (2m-1)!! = 1 * 3 * 5 * ... * (2m-1)

    function doubleFactorial(n: number): number {
        if (n <= 0) return 1;
        let res = 1;
        for (let i = n; i > 0; i -= 2) res *= i;
        return res;
    }

    pMM = Math.pow(-1, absM) * doubleFactorial(2 * absM - 1) * Math.pow(1 - x * x, absM / 2);

    if (l === absM) return pMM;

    // pM1 = P_{m+1}^m(x)
    let pM1 = x * (2 * absM + 1) * pMM;
    if (l === absM + 1) return pM1;

    // Recurrence for higher l
    let pLL = 0;
    for (let ll = absM + 2; ll <= l; ll++) {
        pLL = (x * (2 * ll - 1) * pM1 - (ll + absM - 1) * pMM) / (ll - absM);
        pMM = pM1;
        pM1 = pLL;
    }

    return pM1;
}

// Associated Laguerre Polynomials L_n^k(x)
export function laguerre(n: number, k: number, x: number): number {
    if (n === 0) return 1;
    if (n === 1) return 1 + k - x;

    let l0 = 1;
    let l1 = 1 + k - x;
    let lNext = 0;

    for (let i = 1; i < n; i++) {
        lNext = ((2 * i + 1 + k - x) * l1 - (i + k) * l0) / (i + 1);
        l0 = l1;
        l1 = lNext;
    }

    return l1;
}

// Spherical Harmonics Y_l^m(theta, phi)
// theta is polar angle [0, PI], phi is azimuthal angle [0, 2PI]
export function sphericalHarmonic(l: number, m: number, theta: number, phi: number): { real: number, imag: number } {
    const absM = Math.abs(m);
    const norm = Math.sqrt(((2 * l + 1) * factorial(l - absM)) / (4 * Math.PI * factorial(l + absM)));
    const pLM = legendre(l, m, Math.cos(theta));

    const phase = m * phi;
    const real = norm * pLM * Math.cos(phase);
    const imag = norm * pLM * Math.sin(phase);

    // Condon-Shortley phase is often included in the definition of P_l^m or Y_l^m
    // In our legendre function, we already included (-1)^m

    return { real, imag };
}

// Radial Wave Function R_{nl}(r)
// a0 is Bohr radius (set to 1 for atomic units)
export function radialWaveFunction(n: number, l: number, r: number, a0: number = 1): number {
    const rho = (2 * r) / (n * a0);
    const norm = Math.sqrt(
        Math.pow(2 / (n * a0), 3) * (factorial(n - l - 1) / (2 * n * Math.pow(factorial(n + l), 1)))
    );

    // Wait, normalization factor correct?
    // N_nl = sqrt( (2/na0)^3 * (n-l-1)! / (2n * [(n+l)!]^3 ) )
    // But common Laguerre definition L_{n-l-1}^{2l+1} often has different normalization in math libraries.
    // Using formula from Griffiths or Wikipedia
    const lag = laguerre(n - l - 1, 2 * l + 1, rho);

    return norm * Math.exp(-rho / 2) * Math.pow(rho, l) * lag;
}

// Complete Wave Function psi(r, theta, phi)
export function waveFunction(n: number, l: number, m: number, r: number, theta: number, phi: number): { real: number, imag: number } {
    const R = radialWaveFunction(n, l, r);
    const Y = sphericalHarmonic(l, m, theta, phi);

    return {
        real: R * Y.real,
        imag: R * Y.imag
    };
}

// Probability Density |psi|^2
export function probabilityDensity(n: number, l: number, m: number, r: number, theta: number, phi: number): number {
    const psi = waveFunction(n, l, m, r, theta, phi);
    return psi.real * psi.real + psi.imag * psi.imag;
}

// Real Wave Function (for chemical representation)
// m > 0: px, dxz... (based on cosine portion)
// m < 0: py, dxy... (based on sine portion)
export function realWaveFunction(n: number, l: number, m: number, r: number, theta: number, phi: number): number {
    const R = radialWaveFunction(n, l, r);
    const absM = Math.abs(m);
    const norm = Math.sqrt(((2 * l + 1) * factorial(l - absM)) / (4 * Math.PI * factorial(l + absM)));
    const pLM = legendre(l, absM, Math.cos(theta));

    if (m === 0) {
        return R * norm * pLM;
    }

    const trig = m > 0 ? Math.cos(m * phi) : Math.sin(absM * phi);
    const realNorm = Math.sqrt(2) * norm;
    return R * realNorm * pLM * trig;
}

// Hybrid Wave Functions (sp, sp2, sp3)
export function hybridWaveFunction(
    type: 'sp' | 'sp2' | 'sp3',
    index: number, // 0 to (count-1)
    r: number,
    theta: number,
    phi: number
): number {
    const s = realWaveFunction(2, 0, 0, r, theta, phi); // 2s
    const px = realWaveFunction(2, 1, 1, r, theta, phi); // 2px
    const py = realWaveFunction(2, 1, -1, r, theta, phi); // 2py
    const pz = realWaveFunction(2, 1, 0, r, theta, phi); // 2pz

    if (type === 'sp') {
        const sign = index === 0 ? 1 : -1;
        return (1 / Math.sqrt(2)) * (s + sign * pz);
    }

    if (type === 'sp2') {
        // Linear combinations in XY plane
        if (index === 0) return (1 / Math.sqrt(3)) * s + (Math.sqrt(2 / 3)) * px;
        if (index === 1) return (1 / Math.sqrt(3)) * s - (1 / Math.sqrt(6)) * px + (1 / Math.sqrt(2)) * py;
        if (index === 2) return (1 / Math.sqrt(3)) * s - (1 / Math.sqrt(6)) * px - (1 / Math.sqrt(2)) * py;
    }

    if (type === 'sp3') {
        // Tetrahedral combinations
        if (index === 0) return 0.5 * (s + px + py + pz);
        if (index === 1) return 0.5 * (s + px - py - pz);
        if (index === 2) return 0.5 * (s - px + py - pz);
        if (index === 3) return 0.5 * (s - px - py + pz);
    }

    return 0;
}
