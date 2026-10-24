import sys
path = r'C:\Users\LOQ\Desktop\bhooo\PlayablePrototype\js\ai\yakshiAI.js'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Make scarier
c = c.replace("this.stalkSpeed = 3.0;", "this.stalkSpeed = 3.8;")
c = c.replace("this.huntSpeed = 7.2;", "this.huntSpeed = 8.5;")
c = c.replace("this.retreatSpeed = 10.5;", "this.retreatSpeed = 12.0;")
c = c.replace("this.lureCooldown = 12.0;", "this.lureCooldown = 8.0;")
c = c.replace("this.randomSpawnInterval = 25 + Math.random() * 20;", "this.randomSpawnInterval = 10 + Math.random() * 12;")
c = c.replace("this.jumpScareCooldown = 30.0;", "this.jumpScareCooldown = 12.0;")
c = c.replace("this._scaredAlpha = 0.88;", "this._scaredAlpha = 0.97;")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('done')
