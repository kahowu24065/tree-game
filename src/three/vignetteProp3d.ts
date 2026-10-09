/**
 * 1.4.66 「今日小事」 scene props: when the daily vignette mentions something left in the garden
 * (drawing, compost bag, leaf pile, feather, aphids, visiting cat), spawn a small tappable mesh
 * under / beside the tree for the day; clear it when the event id changes.
 */
import * as THREE from 'three';
import { merge, paint } from './util3d';

export type VignettePropKind = 'drawing' | 'compost' | 'leaves' | 'birds' | 'aphids' | 'cat';

/** Which daily-event ids leave a visible object in the scene (atmosphere-only days have none). */
export function vignettePropKind(eventId: string): VignettePropKind | null {
  switch (eventId) {
    case 'drawing':
    case 'compost':
    case 'leaves':
    case 'birds':
    case 'aphids':
    case 'cat':
      return eventId;
    default:
      return null;
  }
}

export class VignetteProp3D {
  group = new THREE.Group();
  kind: VignettePropKind | null = null;
  private fade = 0;
  private want = 0;
  private built: VignettePropKind | null = null;
  private mats: THREE.Material[] = [];

  constructor() {
    this.group.visible = false;
    this.group.name = 'vignette-prop';
  }

  /** Island-unit offset from the trunk for each prop (front-right under the canopy by default). */
  spot(kind: VignettePropKind): { x: number; z: number; y: number; s: number } {
    switch (kind) {
      case 'drawing':
        return { x: 0.55, z: 0.85, y: 0.02, s: 1 };
      case 'compost':
        return { x: -0.7, z: 0.55, y: 0.02, s: 1 };
      case 'leaves':
        return { x: 0.35, z: -0.75, y: 0.015, s: 1 };
      case 'birds':
        return { x: 0.2, z: 0.55, y: 0.02, s: 1 };
      case 'aphids':
        return { x: 0.08, z: 0.12, y: 0.35, s: 0.85 };
      case 'cat':
        return { x: -0.55, z: -0.65, y: 0.02, s: 1 };
    }
  }

  setKind(kind: VignettePropKind | null): void {
    this.want = kind ? 1 : 0;
    if (kind && kind !== this.built) this.rebuild(kind);
    if (!kind && this.built && this.fade <= 0.02) this.clear();
    this.kind = kind;
  }

  update(dt: number, reduced: boolean): void {
    const speed = reduced ? 8 : 2.4;
    this.fade += (this.want - this.fade) * Math.min(1, dt * speed);
    if (this.want < 0.5 && this.fade < 0.02) {
      this.clear();
      return;
    }
    this.group.visible = this.fade > 0.02;
    this.group.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      const apply = (mat: THREE.Material) => {
        mat.transparent = true;
        (mat as THREE.MeshStandardMaterial).opacity = this.fade;
      };
      if (Array.isArray(m)) m.forEach(apply);
      else apply(m);
    });
  }

  /** World-ish pick radius in island units. */
  pickRadius(): number {
    return this.built === 'cat' ? 0.45 : this.built === 'compost' ? 0.4 : 0.32;
  }

  dispose(): void {
    this.clear();
  }

  private clear(): void {
    while (this.group.children.length) {
      const c = this.group.children[0]!;
      this.group.remove(c);
      c.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
        }
      });
    }
    for (const m of this.mats) m.dispose();
    this.mats = [];
    this.built = null;
    this.kind = null;
    this.group.visible = false;
  }

  private mat(m: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
    this.mats.push(m);
    m.transparent = true;
    return m;
  }

  private rebuild(kind: VignettePropKind): void {
    this.clear();
    this.built = kind;
    this.kind = kind;
    const g = this.group;
    if (kind === 'drawing') {
      // Child's paper drawing flat on the ground.
      const paper = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.3),
        this.mat(new THREE.MeshStandardMaterial({ color: '#f7f1e3', roughness: 0.95, flatShading: true, side: THREE.DoubleSide })),
      );
      paper.rotation.x = -Math.PI / 2;
      paper.position.y = 0.012;
      const scribble = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22, 0.16),
        this.mat(new THREE.MeshStandardMaterial({ color: '#5aa8e0', roughness: 1, flatShading: true, side: THREE.DoubleSide })),
      );
      scribble.rotation.x = -Math.PI / 2;
      scribble.position.y = 0.018;
      // Stick-figure tree: a brown trunk + green crown.
      const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.01, 0.1),
        this.mat(new THREE.MeshStandardMaterial({ color: '#8b5a2b', roughness: 1, flatShading: true })),
      );
      trunk.position.set(0, 0.02, -0.02);
      const crown = new THREE.Mesh(
        new THREE.CircleGeometry(0.07, 8),
        this.mat(new THREE.MeshStandardMaterial({ color: '#4caf50', roughness: 1, flatShading: true, side: THREE.DoubleSide })),
      );
      crown.rotation.x = -Math.PI / 2;
      crown.position.set(0, 0.022, 0.06);
      g.add(paper, scribble, trunk, crown);
    } else if (kind === 'compost') {
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.28, 0.22),
        this.mat(new THREE.MeshStandardMaterial({ color: '#6b8f4e', roughness: 0.9, flatShading: true })),
      );
      bag.position.y = 0.14;
      bag.rotation.y = 0.4;
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.06, 0.18),
        this.mat(new THREE.MeshStandardMaterial({ color: '#8b6a3a', roughness: 1, flatShading: true })),
      );
      mouth.position.set(0, 0.28, 0);
      const crumb = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.06, 0),
        this.mat(new THREE.MeshStandardMaterial({ color: '#5a4030', roughness: 1, flatShading: true })),
      );
      crumb.position.set(0.18, 0.04, 0.12);
      g.add(bag, mouth, crumb);
    } else if (kind === 'leaves') {
      const geos: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 7; i++) {
        const leaf = new THREE.CircleGeometry(0.08 + (i % 3) * 0.02, 5);
        leaf.scale(1, 0.55, 1);
        leaf.rotateX(-Math.PI / 2);
        leaf.rotateZ(i * 0.9);
        leaf.translate(Math.cos(i) * 0.12, 0.01 + i * 0.008, Math.sin(i) * 0.12);
        paint(leaf, new THREE.Color().setHSL(0.22, 0.45, 0.32 + (i % 3) * 0.06));
        geos.push(leaf);
      }
      const pile = new THREE.Mesh(merge(geos, true), this.mat(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })));
      g.add(pile);
    } else if (kind === 'birds') {
      // A soft feather left after the visit.
      const vane = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.22, 5),
        this.mat(new THREE.MeshStandardMaterial({ color: '#e8e0d4', roughness: 0.85, flatShading: true })),
      );
      vane.rotation.z = Math.PI / 2;
      vane.rotation.y = 0.5;
      vane.position.set(0.05, 0.03, 0);
      const quill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.18, 5),
        this.mat(new THREE.MeshStandardMaterial({ color: '#c9b89a', roughness: 0.9, flatShading: true })),
      );
      quill.rotation.z = Math.PI / 2;
      quill.rotation.y = 0.5;
      g.add(vane, quill);
    } else if (kind === 'aphids') {
      for (let i = 0; i < 5; i++) {
        const bug = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 6, 4),
          this.mat(new THREE.MeshStandardMaterial({ color: i % 2 ? '#7cb342' : '#9ccc65', roughness: 0.6, flatShading: true })),
        );
        bug.position.set(Math.cos(i * 1.4) * 0.1, 0.04 + (i % 3) * 0.05, Math.sin(i * 1.4) * 0.08);
        g.add(bug);
      }
    } else if (kind === 'cat') {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 6),
        this.mat(new THREE.MeshStandardMaterial({ color: '#d4a574', roughness: 0.85, flatShading: true })),
      );
      body.scale.set(1.2, 0.75, 0.9);
      body.position.y = 0.12;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 6),
        this.mat(new THREE.MeshStandardMaterial({ color: '#c99660', roughness: 0.85, flatShading: true })),
      );
      head.position.set(0.14, 0.2, 0);
      const earL = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.07, 4),
        this.mat(new THREE.MeshStandardMaterial({ color: '#c99660', roughness: 0.9, flatShading: true })),
      );
      earL.position.set(0.1, 0.3, 0.05);
      const earR = earL.clone();
      earR.position.z = -0.05;
      const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.02, 0.28, 5),
        this.mat(new THREE.MeshStandardMaterial({ color: '#d4a574', roughness: 0.9, flatShading: true })),
      );
      tail.rotation.z = 0.9;
      tail.position.set(-0.22, 0.16, 0);
      g.add(body, head, earL, earR, tail);
    }
    this.fade = 0;
    this.group.visible = true;
  }
}
