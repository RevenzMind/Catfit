const fs = require('fs-extra')
const path = require('path')

const src = path.join(__dirname, '../Front/.next/standalone')
const dest = path.join(__dirname, '../standalone')
const staticSrc = path.join(__dirname, '../Front/.next/static')
const staticDest = path.join(dest, 'Front/.next/static')
const publicSrc = path.join(__dirname, '../Front/public')
const publicDest = path.join(dest, 'Front/public')

fs.removeSync(dest)
fs.copySync(src, dest)
fs.copySync(staticSrc, staticDest)
if (fs.existsSync(publicSrc)) fs.copySync(publicSrc, publicDest)

console.log('Standalone copied!')
