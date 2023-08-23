function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className

    return elemento
}

class Barreira {
    #borda = novoElemento('div', 'borda')
    #corpo = novoElemento('div', 'corpo')

    constructor(reversa = false) {
        this.elemento = novoElemento('div', 'barreira');

        this.elemento.appendChild(reversa ? this.#corpo : this.#borda);
        this.elemento.appendChild(reversa ? this.#borda : this.#corpo);
    }

    set alturaBarreira(altura) {
        this.#corpo.style.height = `${altura}px`;
    }
}


class ParDeBarreiras {
    
    constructor(altura, abertura, x) {
        this.altura = altura
        this.superior = new Barreira(true);
        this.inferior = new Barreira(false);
        this.abertura = abertura
        this.elemento = novoElemento('div', 'par-de-barreiras');


        this.elemento.appendChild(this.superior.elemento);
        this.elemento.appendChild(this.inferior.elemento);

        this.sortearAbertura();

        this.eixoX = x;
    }

    get eixoX() {
        return parseInt(this.elemento.style.left.split('px')[0]);
    }

    set eixoX(x) {
        this.elemento.style.left = `${x}px`;
    }

    get largura() {
        return this.elemento.clientWidth;
    }

    sortearAbertura() {
        const alturaSuperior = Math.random() * (this.altura - this.abertura);
        const alturaInferior = this.altura - this.abertura - alturaSuperior;
        this.superior.alturaBarreira = alturaSuperior;
        this.inferior.alturaBarreira = alturaInferior;
    }
}


class Barreiras {
    #deslocamento = 3
    constructor(altura, largura, abertura, espaco, notificarPonto) {
        this.pares = [
            new ParDeBarreiras(altura, abertura, largura),
            new ParDeBarreiras(altura, abertura, largura + espaco),
            new ParDeBarreiras(altura, abertura, largura + espaco * 2),
            new ParDeBarreiras(altura, abertura, largura + espaco * 3)
        ];
        this.espaco = espaco
        this.largura = largura

        this.notificarPonto = notificarPonto
        this.animar();
    }

    animar() {
        this.pares.forEach(par => {
            par.eixoX = par.eixoX - this.#deslocamento;

            if (par.eixoX < -par.largura) {
                par.eixoX = par.eixoX + this.espaco * this.pares.length;
                par.sortearAbertura();
            }

            const meio = this.largura / 2;
            const cruzouOMeio = par.eixoX + this.#deslocamento >= meio && par.eixoX < meio;

            if (cruzouOMeio) {
                this.notificarPonto();
            }
        });
    }
}

class Passaro {
    constructor(alturaJogo) {
        this.voando = false;
        this.alturaJogo = alturaJogo

        this.elemento = novoElemento('img', 'passaro');
        this.elemento.src = 'imgs/passaro.png';

        this.configurarEventos()

        window.oncontextmenu = e => e.preventDefault();
        window.onselectstart = e => e.preventDefault();

        this.eixoY = alturaJogo / 2;
    }

    configurarEventos() {
        const eventos = {
            'keydown': () => this.voando = true,
            'keyup': () => this.voando = false,
            'mousedown': () => this.voando = true,
            'mouseup': () => this.voando = false,
            'touchstart': () => this.voando = true,
            'touchend': () => this.voando = false
        };

        for (const evento in eventos) {
            window.addEventListener(evento, eventos[evento]);
        }
    }


    get eixoY() {
        return parseInt(this.elemento.style.bottom.split('px')[0])
    }

    set eixoY(y) {
        this.elemento.style.bottom = `${y}px`
    }


    animar() {
        const novoY = this.eixoY + (this.voando ? 8 : -5);
        const alturaMaxima = this.alturaJogo - this.elemento.clientHeight;

        if (novoY <= 0) {
            this.eixoY = 0;
        } else if (novoY >= alturaMaxima) {
            this.eixoY = alturaMaxima;
        } else {
            this.eixoY = novoY;
        }
    }
}

class Progresso {
    constructor() {
        this.elemento = novoElemento('span', 'progresso')
        this.pontos = 0
        this.elemento.innerHTML = this.pontos
    }
    atualizarPontos() {
        this.elemento.innerHTML = ++this.pontos
    }

}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(par => {
        if (!colidiu) {
            console.log(par)
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

class FlappyBird {
    constructor() {
        const areaDoJogo = document.querySelector('[wm-flappy]')
        const altura = areaDoJogo.clientHeight
        const largura = areaDoJogo.clientWidth
    
        const progresso = new Progresso()
        const barreiras = new Barreiras(altura, largura, 200, 400, () => {
            progresso.atualizarPontos()
        })
        const passaro = new Passaro(altura)
        passaro.animar()
    
        areaDoJogo.appendChild(progresso.elemento)
        areaDoJogo.appendChild(passaro.elemento)
        barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
        this.start = () => {
            // loop do jogo
            const temporizador = setInterval(() => {
                barreiras.animar()
                passaro.animar()
    
                if (colidiu(passaro, barreiras)) {
                    clearInterval(temporizador)
                    window.onclick = e => location.reload()
                    window.onkeydown = e => location.reload()
                }
            }, 20)
        }
    }
}


new FlappyBird().start()