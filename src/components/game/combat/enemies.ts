export const skeleton1 = generateEnemy("Skeleton", "Skeleton1.png", 100, 10, 100);
export const skeleton2 = generateEnemy("Skeleton", "Skeleton1.png", 100, 10, 100);
export const skeleton3 = generateEnemy("Skeleton", "Skeleton1.png", 100, 10, 100);

function generateEnemy(name: string, image: string, maxHealth: number, attack: number, experience: number) {
    return {
        id: crypto.randomUUID(),
        image: image,
        name: name,
        health: maxHealth,
        maxHealth: maxHealth,
        experience: experience,
        attack: attack,
    }
}