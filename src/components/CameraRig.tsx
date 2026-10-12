import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/**
 * CÁMARA E CONTROIS
 * =================
 * A caixa de visualización ten sempre a mesma escala de obxecto (o cubo
 * unitario representa ±range), así que a cámara non necesita moverse ao
 * cambiar de orbital: só hai que enmarcala unha vez, ben centrada.
 *
 * Dous detalles que hai que coidar (e que causaban que a escena aparecese
 * desprazada cara arriba-á esquerda):
 *
 *  1. `OrbitControls.update()` NON respecta un `camera.lookAt()` feito a man:
 *     re-deriva a orientación da cámara a partir do seu `target` interno, que
 *     por defecto é (0,0,0) pero que hai que fixar explicitamente e despois
 *     chamar a `update()` para que se aplique.
 *  2. O damping (inercia) interpola desde o estado inicial, así que hai que
 *     repoñelo a cero antes de asentar a cámara e reactivalo despois.
 *
 * Tamén se activa o control por TECLADO: antes `OrbitControls` usaba o valor
 * por defecto (keyEvents = false), de xeito que a vista 3D — que é todo o
 * recurso — era inaccesible sen rato.
 */

export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Semiextensión do cubo en unidades de mundo (sizeScalar/2 = 6) e unha
    // marxe para que o orbital non toque os bordos da pantalla.
    const halfExtent = 6;
    const fov = (camera as { fov?: number }).fov ?? 45;
    const fitHeight = halfExtent / Math.tan((fov * Math.PI) / 360);
    // Factor de enmarcado: 1.0 enchería exactamente o alto do lenzo co cubo
    // completo. O orbital ocupa a maior parte do cubo pero a súa bruma máis
    // tenue chega aos bordos, así que se deixa unha marxe para que o núcleo se
    // lea grande sen que a néboa ocupe toda a pantalla.
    const distance = fitHeight * 2.4;

    // ---- CONVENIO QUÍMICO: z VERTICAL ----
    // three.js usa por defecto `up = (0,1,0)`, que é o convenio dos gráficos 3D
    // pero NON o da química. Nos libros de texto o eixe z é o vertical, así que
    // un 2p_z vese como un halterio de arriba a abaixo e un d_z² amosa os seus
    // dous lóbulos sobre a vertical. Aquí cámbiase a vertical da cámara a z.
    camera.up.set(0, 0, 1);

    // Dirección de vista: lixeiramente por riba do plano xy e cara ao +x, de
    // xeito que se vexan os tres eixes e que x quede cara á dereita. A cámara
    // nunca se sitúa sobre o eixe z (iso faría xirar a vista de forma ambigua).
    const dir = camera.position.clone();
    if (dir.lengthSq() < 1e-6 || Math.hypot(dir.x, dir.y) < 1e-3) {
      dir.set(0.78, -0.56, 0.28);
    }
    dir.normalize();

    controls.target.set(0, 0, 0);
    camera.position.copy(dir.multiplyScalar(distance));
    camera.lookAt(controls.target);

    // O damping interpolaría desde un estado anterior: desactívao para asentar
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = damping;

    camera.updateProjectionMatrix();
    // A cámara é estable: só se enmarca unha vez ao montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 0, 0]}
      enableDamping
      dampingFactor={0.06}
      minDistance={4}
      maxDistance={80}
      keyEvents
      zoomSpeed={0.8}
      rotateSpeed={0.85}
    />
  );
}
