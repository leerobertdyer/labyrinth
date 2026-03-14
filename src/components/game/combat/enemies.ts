export const skeleton1 = generateEnemy({
  name: "Skeleton",
  image: "Skeleton1.png",
  maxHealth: 100,
  minHealth: 35,
  attack: 8,
  experience: 100,
  speed: 3,
  defense: 2
});
export const skeleton2 = generateEnemy({
  name: "Skeleton",
  image: "Skeleton1.png",
  maxHealth: 100,
  minHealth: 35,
  attack: 8,
  experience: 100,
  speed: 3,
  defense: 2
});
export const skeleton3 = generateEnemy({
  name: "Skeleton",
  image: "Skeleton1.png",
  maxHealth: 100,
  minHealth: 35,
  attack: 8,
  experience: 100,
  speed: 3,
  defense: 2
});

type IGenerateEnemy = {
  name: string;
  image: string;
  maxHealth: number;
  minHealth: number;
  attack: number;
  experience: number;
  speed: number;
  defense: number;
}
function generateEnemy({
  name,
  image,
  minHealth,
  maxHealth,
  attack,
  experience,
  speed,
  defense
}: IGenerateEnemy) {
  const randomMaxHealth = Math.ceil(
    Math.max(minHealth, Math.random() * maxHealth),
  );
  return {
    id: crypto.randomUUID(),
    image: image,
    name: name,
    health: randomMaxHealth,
    maxHealth: randomMaxHealth,
    experience: experience,
    attack: attack,
    selected: false,
    speed,
    defense
  };
}
