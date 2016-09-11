const randomInt = (max) => Math.min(max, Math.max(0, Math.round(Math.random() * max)));

export const randomRGBA = (alpha) => 'rgba(' + randomInt(256) + ',' + randomInt(256) + ',' + randomInt(256) + ',' + alpha + ')';
