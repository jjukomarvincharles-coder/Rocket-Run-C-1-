// Joins src/css + src/html + src/js into ONE self-contained HTML file (works by double-click, no server needed).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = path.join(root, 'src');
const read = d => fs.readdirSync(path.join(src, d)).filter(f => !f.startsWith('.')).sort()
  .map(f => fs.readFileSync(path.join(src, d, f), 'utf8')).join('');
const tpl = fs.readFileSync(path.join(src, 'index.template.html'), 'utf8');
const out = tpl.replace('/*@CSS@*/', () => read('css')).replace('<!--@HTML@-->', () => read('html')).replace('/*@JS@*/', () => read('js'));
for (const f of ['dist/ROCKET_RUN.html', 'www/index.html']) {
  fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
  fs.writeFileSync(path.join(root, f), out);
}
for (const target of ['dist','www']) {
  const assetsFrom=path.join(root,'assets');
  if(fs.existsSync(assetsFrom)){
    const assetsTo=path.join(root,target,'assets'); fs.rmSync(assetsTo,{recursive:true,force:true}); fs.cpSync(assetsFrom,assetsTo,{recursive:true});
  }
  const publicFrom=path.join(root,'public');
  if(fs.existsSync(publicFrom)){
    for(const item of fs.readdirSync(publicFrom)){
      const from=path.join(publicFrom,item),to=path.join(root,target,item);
      if(fs.statSync(from).isDirectory()){fs.rmSync(to,{recursive:true,force:true});fs.cpSync(from,to,{recursive:true});}
      else fs.copyFileSync(from,to);
    }
  }
}
console.log('Built dist/ROCKET_RUN.html and www/index.html (' + Math.round(out.length / 1024) + ' KB)');
