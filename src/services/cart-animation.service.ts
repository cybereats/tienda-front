import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartAnimationService {
  private foodEmojis = ['🍔', '🍕', '🌮', '🌯', '🍟', '🍗', '🍖', '🥓', '🍳', '🥪', '🥗', '🍜', '🍝', '🍣', '🍱', '🍛', '🍲', '🥘', '🧆', '🥙', '🍤', '🍿', '🧀', '🥐', '🥨', '🥯', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '🍮', '🍦', '🍨', '🍧', '🥤', '🧃', '🍹', '🧋'];

  animateToCart(event: MouseEvent): void {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    // Crear un solo emoji
    this.createFlyingEmoji(startX, startY, endX, endY, 'toCart');

    // Hacer que el carrito rebote
    setTimeout(() => {
      cartIcon.classList.add('cart-bounce');
      setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
    }, 600);
  }

  animateFromCart(event: MouseEvent): void {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();
    const startX = cartRect.left + cartRect.width / 2;
    const startY = cartRect.top + cartRect.height / 2;
    const endX = event.clientX;
    const endY = event.clientY;

    // Hacer que el carrito rebote primero
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);

    // Crear emoji que sale del carrito
    this.createFlyingEmoji(startX, startY, endX, endY, 'fromCart');
  }

  private createFlyingEmoji(startX: number, startY: number, endX: number, endY: number, direction: 'toCart' | 'fromCart'): void {
    const emoji = document.createElement('div');
    emoji.className = 'flying-emoji';
    emoji.textContent = this.getRandomEmoji();

    const isToCart = direction === 'toCart';
    const animationName = isToCart ? 'flyToCart' : 'flyFromCart';

    emoji.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      font-size: 2rem;
      pointer-events: none;
      z-index: 10000;
      transition: none;
    `;

    document.body.appendChild(emoji);

    // Forzar reflow
    emoji.offsetHeight;

    // Usar requestAnimationFrame para animación suave
    requestAnimationFrame(() => {
      emoji.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        font-size: 2rem;
        pointer-events: none;
        z-index: 10000;
        animation: ${animationName} 0.5s ease-out forwards;
      `;

      // Crear keyframes dinámicos - línea directa
      const styleSheet = document.createElement('style');

      if (isToCart) {
        styleSheet.textContent = `
          @keyframes ${animationName} {
            0% {
              left: ${startX}px;
              top: ${startY}px;
              transform: scale(1);
              opacity: 1;
            }
            100% {
              left: ${endX}px;
              top: ${endY}px;
              transform: scale(0.3);
              opacity: 0;
            }
          }
        `;
      } else {
        styleSheet.textContent = `
          @keyframes ${animationName} {
            0% {
              left: ${startX}px;
              top: ${startY}px;
              transform: scale(0.3);
              opacity: 1;
            }
            100% {
              left: ${endX}px;
              top: ${endY}px;
              transform: scale(1.2);
              opacity: 0;
            }
          }
        `;
      }
      document.head.appendChild(styleSheet);

      // Limpiar después de la animación
      setTimeout(() => {
        emoji.remove();
        styleSheet.remove();
      }, 600);
    });
  }

  private getRandomEmoji(): string {
    return this.foodEmojis[Math.floor(Math.random() * this.foodEmojis.length)];
  }

  animateOrdersIcon(): void {
    const ordersIcon = document.querySelector('.orders-icon');
    if (!ordersIcon) return;

    // Añadir clase de animación
    ordersIcon.classList.add('orders-celebrate');

    // Crear confeti de emojis alrededor del icono
    const rect = ordersIcon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const celebrationEmojis = ['🎉', '✨', '🎊', '⭐', '💫'];

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.className = 'celebration-emoji';
        emoji.textContent = celebrationEmojis[i % celebrationEmojis.length];

        const angle = (i / 5) * 2 * Math.PI;
        const distance = 50;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;

        emoji.style.cssText = `
          position: fixed;
          left: ${centerX}px;
          top: ${centerY}px;
          font-size: 1.2rem;
          pointer-events: none;
          z-index: 10000;
          animation: celebrateEmoji${i} 0.8s ease-out forwards;
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          @keyframes celebrateEmoji${i} {
            0% {
              left: ${centerX}px;
              top: ${centerY}px;
              transform: scale(0) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: scale(1.5) rotate(180deg);
              opacity: 1;
            }
            100% {
              left: ${endX}px;
              top: ${endY - 30}px;
              transform: scale(0.5) rotate(360deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(styleSheet);
        document.body.appendChild(emoji);

        setTimeout(() => {
          emoji.remove();
          styleSheet.remove();
        }, 900);
      }, i * 50);
    }

    // Quitar clase después de la animación
    setTimeout(() => {
      ordersIcon.classList.remove('orders-celebrate');
    }, 1000);
  }
}
