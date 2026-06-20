import { useEffect, useRef } from 'react';

interface FallingPetalsProps {
  speed?: number;
  density?: number;
}

export default function FallingPetals({
  speed = 1.3,
  density = 50,
}: FallingPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleTypes = ['sakura', 'rose', 'gold', 'maple', 'snow', 'mint', 'lilac', 'willow', 'feather'] as const;

    class Petal {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;
      petalType: typeof particleTypes[number];

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height - 20;
        this.size = Math.random() * 12 + 6;
        this.rotation = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.4;

        this.petalType = particleTypes[Math.floor(Math.random() * particleTypes.length)];

        // Base physics speed configuration
        this.speedY = (Math.random() * 1.5 + 1) * speed;
        this.speedX = Math.random() * 1.2 - 0.6 + 0.3;
        this.rotationSpeed = (Math.random() * 0.02 - 0.01) * speed;

        // Custom physics by type
        if (this.petalType === 'feather') {
          this.speedY = (Math.random() * 0.4 + 0.2) * speed; // Slow drifting fall
          this.speedX = (Math.random() * 1.6 - 0.8) + 0.5; // High horizontal drift
          this.rotationSpeed = (Math.random() * 0.008 - 0.004) * speed;
        } else if (this.petalType === 'willow') {
          this.speedY = (Math.random() * 1.8 + 1.2) * speed; // Head-first, slightly faster fall
          this.speedX = (Math.random() * 1.0 - 0.5) + 0.2;
        } else if (this.petalType === 'lilac') {
          this.rotationSpeed = (Math.random() * 0.05 + 0.03) * speed; // Spin faster like a pinwheel
        }

        // Color palettes
        if (this.petalType === 'sakura') {
          const colors = ['#FFEBEE', '#FCE4EC', '#F8BBD0', '#F48FB1', '#FFCDD2']; // Hồng phấn, anh đào
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'rose') {
          const colors = ['#FF8A80', '#FF5252', '#FF1744', '#D50000', '#C62828']; // Đỏ nhung, đỏ thuần
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'gold') {
          const colors = ['#FFF59D', '#FFE082', '#FFD54F', '#FFCA28', '#FFB300']; // Vàng gold hạt sáng
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'maple') {
          const colors = ['#E65100', '#EF6C00', '#F57C00', '#FF9800', '#D84315']; // Cam cháy, đỏ lá phong
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'snow') {
          const colors = ['#E0F7FA', '#B2EBF2', '#E1F5FE', '#FFFFFF']; // Trắng tuyết, xanh đá
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'mint') {
          const colors = ['#A5D6A7', '#81C784', '#C8E6C9']; // Xanh lục tươi, xanh mint, xanh sage
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'lilac') {
          const colors = ['#E1BEE7', '#CE93D8', '#B39DDB']; // Tím pastel, tím lavender, hồng tím
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (this.petalType === 'willow') {
          const colors = ['#C5E1A5', '#9CCC65', '#AED581']; // Xanh lá liễu mềm, xanh rêu nhạt
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else { // feather
          const colors = ['#FFFFFF', '#FFF9C4', '#F5F5F5']; // Trắng tinh khôi, hồng tro siêu nhạt, kem
          this.color = colors[Math.floor(Math.random() * colors.length)];
        }
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20) {
          this.y = -20;
          this.x = Math.random() * width;
        }
        if (this.x > width + 20) this.x = -20;
        if (this.x < -20) this.x = width + 20;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.beginPath();

        // Custom opacity rendering and transforms based on physics type
        if (this.petalType === 'gold') {
          c.globalAlpha = this.opacity * (0.6 + Math.sin(Date.now() * 0.005 + this.x) * 0.4);
        } else if (this.petalType === 'sakura') {
          c.scale(1, Math.sin(this.rotation));
          c.globalAlpha = this.opacity;
        } else {
          c.globalAlpha = this.opacity;
        }

        c.fillStyle = this.color;

        switch (this.petalType) {
          case 'sakura':
            c.moveTo(0, 0);
            c.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size / 2, -this.size, 0, -this.size);
            c.bezierCurveTo(this.size / 4, -this.size * 1.1, this.size / 2, -this.size, 0, -this.size);
            c.bezierCurveTo(this.size / 2, -this.size, this.size / 2, -this.size / 2, 0, 0);
            c.fill();
            break;

          case 'rose':
            c.ellipse(0, 0, this.size * 1.2, this.size, 0, 0, Math.PI * 2);
            c.fill();
            c.beginPath();
            c.strokeStyle = 'rgba(0,0,0,0.05)';
            c.lineWidth = 1;
            c.moveTo(0, -this.size);
            c.lineTo(0, this.size);
            c.stroke();
            break;

          case 'gold':
            c.moveTo(0, -this.size / 2);
            c.quadraticCurveTo(0, 0, this.size / 2, 0);
            c.quadraticCurveTo(0, 0, 0, this.size / 2);
            c.quadraticCurveTo(0, 0, -this.size / 2, 0);
            c.quadraticCurveTo(0, 0, 0, -this.size / 2);
            c.fill();
            break;

          case 'maple':
            c.moveTo(0, this.size);
            c.lineTo(0, 0);
            c.lineTo(-this.size * 0.6, -this.size * 0.2);
            c.lineTo(-this.size * 0.4, -this.size * 0.5);
            c.lineTo(0, -this.size);
            c.lineTo(this.size * 0.4, -this.size * 0.5);
            c.lineTo(this.size * 0.6, -this.size * 0.2);
            c.closePath();
            c.fill();
            break;

          case 'snow':
            c.strokeStyle = this.color;
            c.lineWidth = 1.5;
            for (let i = 0; i < 6; i++) {
              c.moveTo(0, 0);
              c.lineTo(0, -this.size);
              c.moveTo(0, -this.size * 0.6);
              c.lineTo(-this.size * 0.25, -this.size * 0.8);
              c.moveTo(0, -this.size * 0.6);
              c.lineTo(this.size * 0.25, -this.size * 0.8);
              c.rotate(Math.PI / 3);
            }
            c.stroke();
            break;

          case 'mint':
            // Lá Bạc Hà / Lá Trà Xanh
            c.moveTo(0, -this.size);
            c.bezierCurveTo(-this.size * 0.65, -this.size * 0.5, -this.size * 0.65, this.size * 0.5, 0, this.size);
            c.bezierCurveTo(this.size * 0.65, this.size * 0.5, this.size * 0.65, -this.size * 0.5, 0, -this.size);
            c.fill();
            // Gân lá mờ
            c.beginPath();
            c.strokeStyle = 'rgba(0,0,0,0.08)';
            c.lineWidth = 1;
            c.moveTo(0, -this.size);
            c.lineTo(0, this.size);
            c.stroke();
            break;

          case 'lilac':
            // Cánh Hoa Tử Đinh Hương / Cẩm Tú Cầu (4 cánh)
            for (let i = 0; i < 4; i++) {
              c.save();
              c.rotate((i * Math.PI) / 2);
              c.beginPath();
              c.ellipse(0, -this.size * 0.5, this.size * 0.35, this.size * 0.5, 0, 0, Math.PI * 2);
              c.fill();
              c.restore();
            }
            // Nhụy hoa nhỏ màu vàng nhạt ở trung tâm
            c.beginPath();
            c.fillStyle = '#FFF59D';
            c.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
            c.fill();
            break;

          case 'willow':
            // Lá Liễu Rủ (Mảnh dài uốn lượn)
            c.beginPath();
            const points = 10;
            c.moveTo(0, -this.size * 1.5);
            for (let i = 1; i <= points; i++) {
              const t = i / points;
              const y = -this.size * 1.5 + (this.size * 3) * t;
              // Uốn cong thân lá theo hàm sin qua thời gian
              const x = Math.sin(t * Math.PI + Date.now() * 0.003) * (this.size * 0.25);
              c.lineTo(x, y);
            }
            c.strokeStyle = this.color;
            c.lineWidth = this.size * 0.2;
            c.lineCap = 'round';
            c.stroke();
            break;

          case 'feather':
            // Lông Vũ Mềm Mại
            c.beginPath();
            c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            c.lineWidth = 1;
            c.moveTo(0, -this.size * 1.3);
            c.lineTo(0, this.size * 1.3);
            c.stroke();

            c.beginPath();
            c.ellipse(0, 0, this.size * 0.4, this.size * 1.1, 0, 0, Math.PI * 2);
            c.fill();

            // Sợi lông vũ xước mờ
            c.strokeStyle = this.color;
            c.lineWidth = 0.8;
            const numFibers = 7;
            for (let i = -numFibers; i <= numFibers; i++) {
              const y = (i / numFibers) * this.size * 1.0;
              const widthOffset = Math.cos((i / numFibers) * Math.PI / 2) * this.size * 0.5;
              
              // Sợi bên trái chúc xuống nhẹ
              c.beginPath();
              c.moveTo(0, y);
              c.lineTo(-widthOffset - 1.5, y + 1.5);
              c.stroke();

              // Sợi bên phải chúc xuống nhẹ
              c.beginPath();
              c.moveTo(0, y);
              c.lineTo(widthOffset + 1.5, y + 1.5);
              c.stroke();
            }
            break;
        }

        c.restore();
      }
    }

    const petals: Petal[] = [];
    for (let i = 0; i < density; i++) {
      petals.push(new Petal());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [speed, density]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />;
}
