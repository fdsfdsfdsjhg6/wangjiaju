const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>鐜嬪椹?| 鍒涙剰璁捐甯?| AIGC鍏堥攱鎺㈢储鑰?/title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;cursor:none!important}
:root{--primary:#00D4FF;--primary-light:#00FFFF;--accent:#FF00FF;--glass:rgba(255,255,255,0.05);--glass-border:rgba(255,255,255,0.1)}
html{scroll-behavior:smooth}
body{font-family:'Noto Sans SC',sans-serif;background:#000;color:#fff;overflow-x:hidden;line-height:1.6}
.cursor{position:fixed;width:30px;height:30px;border:2px solid var(--primary);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;animation:cursorPulse 2s infinite}
.cursor::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;background:var(--primary-light);border-radius:50%}
@keyframes cursorPulse{0%,100%{box-shadow:0 0 20px var(--primary)}50%{box-shadow:0 0 40px var(--primary-light),0 0 60px var(--primary)}}
.cursor.hover{width:60px;height:60px;border-color:var(--accent);background:rgba(255,0,255,0.1)}
#trail-container{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;overflow:hidden}
.trail-particle{position:absolute;border-radius:50%;pointer-events:none;animation:trailFade 0.8s ease-out forwards}
@keyframes trailFade{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0)}}
#starfield{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1}
header{position:fixed;top:0;left:0;width:100%;padding:25px 60px;display:flex;justify-content:space-between;align-items:center;z-index:1000;background:linear-gradient(180deg,rgba(0,0,0,0.9) 0%,transparent 100%)}
.logo{font-family:'Orbitron',sans-serif;font-size:28px;font-weight:900;letter-spacing:4px;background:linear-gradient(135deg,var(--primary),var(--primary-light),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:logoGlow 3s infinite}
@keyframes logoGlow{0%,100%{filter:drop-shadow(0 0 10px rgba(0,212,255,0.5))}50%{filter:drop-shadow(0 0 30px rgba(0,255,255,0.8))}}
nav ul{display:flex;list-style:none;gap:50px}
nav a{color:rgba(255,255,255,0.9);text-decoration:none;font-size:13px;font-weight:500;letter-spacing:3px;text-transform:uppercase;position:relative;padding:10px 0;transition:all 0.3s}
nav a::before{content:'';position:absolute;bottom:0;left:50%;width:0;height:2px;background:linear-gradient(90deg,var(--primary),var(--accent));transition:all 0.3s;transform:translateX(-50%)}
nav a:hover{color:var(--primary-light);text-shadow:0 0 20px var(--primary)}
nav a:hover::before{width:100%}
.hero{height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(0,212,255,0.2) 0%,transparent 70%);animation:heroPulse 4s infinite}
@keyframes heroPulse{0%,100%{opacity:0.5}50%{opacity:0.8}}
.hero-content{position:relative;z-index:10}
.hero h1{font-family:'Orbitron',sans-serif;font-size:clamp(50px,12vw,160px);font-weight:900;letter-spacing:20px;margin-bottom:10px;background:linear-gradient(135deg,#fff,var(--primary),var(--primary-light),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:heroGlow 4s infinite,heroEntrance 1.5s ease-out}
@keyframes heroGlow{0%,100%{filter:drop-shadow(0 0 30px rgba(0,212,255,0.6))}50%{filter:drop-shadow(0 0 50px rgba(0,255,255,0.8))}}
@keyframes heroEntrance{0%{opacity:0;transform:translateY(100px)}100%{opacity:1;transform:translateY(0)}}
.hero .subtitle{font-size:clamp(18px,4vw,36px);color:rgba(255,255,255,0.8);letter-spacing:15px;text-transform:uppercase;margin-bottom:30px;animation:fadeInUp 1s 0.5s both}
.hero .tagline{font-size:clamp(14px,2vw,20px);color:var(--primary-light);max-width:800px;line-height:2;opacity:0;animation:fadeInUp 1s 0.8s forwards;text-shadow:0 0 20px rgba(0,255,255,0.5)}
@keyframes fadeInUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
.scroll-indicator{position:absolute;bottom:50px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;animation:fadeInUp 1s 1.2s both}
.scroll-indicator span{font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase}
.scroll-line{width:2px;height:60px;background:linear-gradient(180deg,var(--primary),transparent);animation:scrollLine 2s infinite}
@keyframes scrollLine{0%,100%{opacity:1}50%{opacity:0.5}}
.about{min-height:100vh;padding:150px 10%;display:grid;grid-template-columns:1fr 1.2fr;gap:100px;align-items:center;position:relative}
.about::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,212,255,0.03) 0%,transparent 50%,rgba(255,0,255,0.03) 100%)}
.about-image{position:relative;border-radius:30px;overflow:hidden;box-shadow:0 0 80px rgba(0,212,255,0.3),0 0 120px rgba(0,255,255,0.2)}
.about-image img{width:100%;display:block;transition:transform 0.5s}
.about-image:hover img{transform:scale(1.05)}
.about-image::before{content:'';position:absolute;inset:-2px;background:linear-gradient(45deg,var(--primary),var(--accent),var(--primary-light),var(--accent));border-radius:32px;z-index:-1;animation:borderRotate 4s linear infinite}
@keyframes borderRotate{0%{background:linear-gradient(45deg,var(--primary),var(--accent),var(--primary-light))}100%{background:linear-gradient(45deg,var(--accent),var(--primary-light),var(--primary))}}
.about-content{position:relative;z-index:1;animation:fadeInRight 1s 0.3s both}
@keyframes fadeInRight{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
.section-label{font-family:'Orbitron',sans-serif;font-size:14px;color:var(--primary);letter-spacing:5px;text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:15px}
.section-label::before{content:'';width:40px;height:2px;background:linear-gradient(90deg,var(--primary),transparent)}
.about h2{font-family:'Orbitron',sans-serif;font-size:clamp(36px,5vw,64px);font-weight:800;margin-bottom:30px;background:linear-gradient(135deg,#fff 0%,var(--primary) 50%,var(--accent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.about p{font-size:18px;line-height:2.2;color:rgba(255,255,255,0.8);margin-bottom:40px}
.skills-grid{display:flex;flex-wrap:wrap;gap:15px}
.skill-item{padding:15px 30px;background:var(--glass);border:1px solid var(--glass-border);border-radius:50px;font-size:14px;transition:all 0.4s}
.skill-item::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.2),transparent);transform:translateX(-100%);transition:transform 0.5s}
.skill-item:hover::before{transform:translateX(100%)}
.skill-item:hover{transform:translateY(-5px);border-color:var(--primary);box-shadow:0 15px 40px rgba(0,212,255,0.3)}
.skill-item.highlight{background:linear-gradient(135deg,rgba(0,212,255,0.2),rgba(255,0,255,0.15));border-color:var(--primary-light);font-weight:700;box-shadow:0 0 30px rgba(0,212,255,0.3)}
.portfolio{min-height:100vh;padding:120px 5%}
.portfolio .section-title{font-family:'Orbitron',sans-serif;font-size:clamp(36px,6vw,72px);text-align:center;margin-bottom:80px;background:linear-gradient(135deg,var(--primary) 0%,#fff 50%,var(--accent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:titleGlow 3s infinite}
@keyframes titleGlow{0%,100%{filter:drop-shadow(0 0 20px rgba(0,212,255,0.5))}50%{filter:drop-shadow(0 0 40px rgba(255,0,255,0.7))}}
.portfolio-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:40px;max-width:1600px;margin:0 auto}
.portfolio-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:25px;padding:30px;transition:all 0.5s}
.portfolio-card::before{content:'';position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,var(--primary),var(--accent),var(--primary-light));transform:scaleX(0);transform-origin:left;transition:transform 0.5s}
.portfolio-card:hover{transform:translateY(-15px);border-color:var(--primary);box-shadow:0 30px 60px rgba(0,212,255,0.2)}
.portfolio-card:hover::before{transform:scaleX(1)}
.portfolio-card h3{font-family:'Orbitron',sans-serif;font-size:24px;color:var(--primary-light);margin-bottom:25px;display:flex;align-items:center;gap:15px}
.portfolio-card h3::before{content:'';width:12px;height:12px;background:var(--accent);border-radius:50%;animation:cardPulse 2s infinite;box-shadow:0 0 20px var(--accent)}
@keyframes cardPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
.portfolio-items{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}
.portfolio-item{aspect-ratio:1;border-radius:15px;overflow:hidden;position:relative;background:rgba(0,0,0,0.3)}
.portfolio-item img,.portfolio-item video{width:100%;height:100%;object-fit:cover;transition:all 0.5s}
.portfolio-item:hover img,.portfolio-item:hover video{transform:scale(1.15)}
.portfolio-item .overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.8) 100%);opacity:0;transition:opacity 0.3s}
.portfolio-item:hover .overlay{opacity:1}
.contact{min-height:60vh;padding:120px 10%;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative}
.contact::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;background:radial-gradient(circle,rgba(0,212,255,0.1) 0%,transparent 70%)}
.contact h2{font-family:'Orbitron',sans-serif;font-size:clamp(36px,5vw,56px);margin-bottom:30px;background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.contact p{font-size:20px;color:rgba(255,255,255,0.7);margin-bottom:20px}
.contact a{color:var(--primary-light);text-decoration:none;font-size:24px;transition:all 0.3s}
.contact a:hover{color:var(--accent);text-shadow:0 0 30px var(--accent)}
footer{padding:40px;text-align:center;color:rgba(255,255,255,0.4);font-size:14px;border-top:1px solid var(--glass-border);background:rgba(0,0,0,0.5)}
.music-control{position:fixed;bottom:30px;right:30px;z-index:10000}
.music-btn{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#0066FF);border:3px solid var(--primary-light);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(0,212,255,0.5);transition:all 0.3s;animation:musicBtnPulse 3s infinite}
@keyframes musicBtnPulse{0%,100%{box-shadow:0 0 40px rgba(0,212,255,0.5)}50%{box-shadow:0 0 60px rgba(0,212,255,0.8)}}
.music-btn:hover{transform:scale(1.15);box-shadow:0 0 80px rgba(0,255,255,0.8)}
.music-btn svg{width:28px;height:28px;fill:#fff}
.music-btn.playing svg{animation:discSpin 3s linear infinite}
@keyframes discSpin{to{transform:rotate(360deg)}}
@media(max-width:1024px){.about{grid-template-columns:1fr;text-align:center;gap:60px}.about-image{max-width:350px;margin:0 auto}.skills-grid{justify-content:center}nav{display:none}}
@media(max-width:768px){header{padding:20px 30px}.hero h1{letter-spacing:8px}.hero .subtitle{letter-spacing:8px}.portfolio-grid{grid-template-columns:1fr}}
.loading{position:fixed;inset:0;background:#000;display:flex;justify-content:center;align-items:center;z-index:999999;transition:opacity 0.8s}
.loading.hidden{opacity:0;pointer-events:none}
.loader{width:80px;height:80px;border:4px solid var(--glass);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="loading" id="loading"><div class="loader"></div></div>
<div class="cursor" id="cursor"></div>
<div id="trail-container"></div>
<canvas id="starfield"></canvas>
<header>
<div class="logo">WJJ.STUDIO</div>
<nav><ul><li><a href="#home">棣栭〉</a></li><li><a href="#about">鍏充簬</a></li><li><a href="#portfolio">浣滃搧</a></li><li><a href="#contact">鑱旂郴</a></li></ul></nav>
</header>
<section class="hero" id="home">
<div class="hero-content">
<h1>鐜嬪椹?/h1>
<p class="subtitle">鍒涙剰璁捐甯?/p>
<p class="tagline">鐢熸垚寮?AI 涓庤瑙夎壓鏈殑鍏堥攱鎺㈢储鑰?br>浠ヤ唬鐮佷负绗旓紝绠楁硶涓哄ⅷ锛屾暟鎹负鑹诧紝鍦ㄦ棤闄愮淮搴︾殑鍒涙剰绌洪棿涓紝<br>瑙ｉ攣瑙嗚琛ㄨ揪鐨勪笅涓€涓邯鍏冦€?/p>
</div>
<div class="scroll-indicator"><span>Scroll</span><div class="scroll-line"></div></div>
</section>
<section class="about" id="about">
<div class="about-image"><img src="file:///C:/Users/Administrator/Desktop/%E6%88%91.jfif" alt="鐜嬪椹?></div>
<div class="about-content">
<div class="section-label">About Me</div>
<h2>鍏充簬鎴?/h2>
<p>涓€鍚嶄笓娉ㄤ簬AIGC涓庤瑙夎壓鏈殑鍒涙剰璁捐甯堛€傛搮闀垮皢浜哄伐鏅鸿兘鎶€鏈笌浼犵粺璁捐缇庡鐩歌瀺鍚堬紝鍒涢€犲嚭鐙壒鐨勮瑙変綋楠屻€?/p>
<div class="skills-grid">
<span class="skill-item highlight">AI鍥惧儚鐢熸垚</span>
<span class="skill-item highlight">AI褰卞儚鍒涗綔</span>
<span class="skill-item highlight">AI搴旂敤寮€鍙?/span>
<span class="skill-item highlight">鐢熸垚寮廇I</span>
<span class="skill-item">AI寮€鍙?/span>
<span class="skill-item">AIGC</span>
<span class="skill-item">骞抽潰璁捐</span>
<span class="skill-item">鎽勫奖鍓緫</span>
<span class="skill-item">3D妯″瀷</span>
<span class="skill-item">C4D</span>
<span class="skill-item">鐢靛晢缇庡</span>
</div>
</div>
</section>
<section class="portfolio" id="portfolio">
<h2 class="section-title">浣滃搧闆?/h2>
<div class="portfolio-grid">
<div class="portfolio-card"><h3>AI褰卞儚</h3><div class="portfolio-items">
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/AI%E5%BD%B1%E5%83%8F/%E7%BB%8F%E5%9C%B01.png"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/AI%E5%BD%B1%E5%83%8F/%E7%BB%8F%E5%9C%B02.png"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/AI%E5%BD%B1%E5%83%8F/%E7%BB%8F%E5%9C%B03.png"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/AI%E5%BD%B1%E5%83%8F/%E7%BB%8F%E5%9C%B04.png"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/AI%E5%BD%B1%E5%83%8F/%E7%BB%8F%E5%9C%B05.png"><div class="overlay"></div></div>
<div class="portfolio-item"><video src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/AI%E5%BD%B1%E5%83%8F/%E9%A2%84%E5%91%8A%E7%89%87.mp4" muted loop></video><div class="overlay"></div></div>
</div></div>
<div class="portfolio-card"><h3>骞抽潰璁捐</h3><div class="portfolio-items">
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E5%B9%B3%E9%9D%A2%E8%AE%BE%E8%AE%A1/superman.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E5%B9%B3%E9%9D%A2%E8%AE%BE%E8%AE%A1/%E8%B5%9B%E9%93%B6%E5%A3%81.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E5%B9%B3%E9%9D%A2%E8%AE%BE%E8%AE%A1/%E7%81%AB%E7%83%AB%E8%A3%85%E5%A3%81.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E5%B9%B3%E9%9D%A2%E8%AE%BE%E8%AE%A1/%E9%80%8F%E6%98%93%E6%B0%B4.jpg"><div class="overlay"></div></div>
</div></div>
<div class="portfolio-card"><h3>3D妯″瀷</h3><div class="portfolio-items">
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/3D%E6%A8%A1%E5%9E%8B/%E6%89%8B%E6%9C%BA%E6%B8%B2%E6%9F%84%E5%9B%BE.png"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/3D%E6%A8%A1%E5%9E%8B/%E6%89%8B%E6%9C%BA%E5%8D%97%E5%8F%8A.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/3D%E6%A8%A1%E5%9E%8B/%E9%9C%B2%E9%A1%B6%E6%B8%B2%E6%9F%84%E5%9B%BE.png"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/3D%E6%A8%A1%E5%9E%8B/%E9%9C%B2%E9%A1%B6%E5%8D%97%E5%8F%8B.png"><div class="overlay"></div></div>
</div></div>
<div class="portfolio-card"><h3>鐢靛晢缇庡</h3><div class="portfolio-items">
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E7%94%B5%E5%95%86%E7%BE%8E%E5%AD%A6/%E5%93%81%E9%85%B1%E9%A6%991.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E7%94%B5%E5%95%86%E7%BE%8E%E5%AD%A6/%E5%93%81%E9%85%B1%E9%A6%992.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E7%94%B5%E5%95%86%E7%BE%8E%E5%AD%A6/%E5%93%81%E5%90%8A%E5%89%AF%E8%A3%81%E5%9B%BE1.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E7%94%B5%E5%95%86%E7%BE%8E%E5%AD%A6/%E5%93%81%E5%90%8A%E5%89%AF%E8%A3%81%E5%9B%BE2.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><img src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E7%94%B5%E5%95%86%E7%BE%8E%E5%AD%A6/%E5%93%81%E5%90%8A%E5%89%AF%E8%A3%81%E5%9B%BE3.jpg"><div class="overlay"></div></div>
<div class="portfolio-item"><video src="file:///C:/Users/Administrator/Desktop/%E4%BD%9C%E5%93%81/%E7%94%B5%E5%95%86%E7%BE%8E%E5%AD%A6/%E5%B0%8F%E7%8E%89%E7%90%837%20ultra.mp4" muted loop></video><div class="overlay"></div></div>
</div></div>
</div>
</section>
<section class="contact" id="contact">
<h2>鑱旂郴鎴?/h2>
<p>閭锛?a href="mailto:wangjiaju@design.com">wangjiaju@design.com</a></p>
<p style="margin-top:20px;color:var(--primary-light)">璁╁垱鎰忔棤闄愬彲鑳?/p>
</section>
<footer><p>漏 2026 鐜嬪椹?| 鍒涙剰璁捐甯?| AIGC鍏堥攱鎺㈢储鑰?| WJJ.STUDIO</p></footer>
<div class="music-control"><button class="music-btn" id="musicBtn" title="鎾斁鑳屾櫙闊充箰"><svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></button></div>
<audio id="bgMusic" loop preload="auto"><source src="file:///C:/Users/Administrator/Desktop/Groove%20Coverage%20-%20God%20Is%20a%20Girl%20(Chillout%20Mix)_L.ogg" type="audio/ogg"></audio>
<script>
const canvas=document.getElementById("starfield"),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,2000),renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const starsGeometry=new THREE.BufferGeometry(),starCount=3000,positions=new Float32Array(starCount*3),colors=new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){const i3=i*3;positions[i3]=(Math.random()-0.5)*2000;positions[i3+1]=(Math.random()-0.5)*2000;positions[i3+2]=(Math.random()-0.5)*2000;const c=new THREE.Color();c.setHSL(Math.random()*0.2+0.5,0.9,Math.random()*0.5+0.5);colors[i3]=c.r;colors[i3+1]=c.g;colors[i3+2]=c.b}
starsGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));starsGeometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
const starsMaterial=new THREE.PointsMaterial({size:2,vertexColors:true,transparent:true,opacity:0.8,sizeAttenuation:true}),starField=new THREE.Points(starsGeometry,starsMaterial);
scene.add(starField);camera.position.z=500;
function animate(){requestAnimationFrame(animate);starField.rotation.y+=0.0002;starField.rotation.x+=0.0001;renderer.render(scene,camera)}animate();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const cursor=document.getElementById("cursor"),trailContainer=document.getElementById("trail-container");
document.addEventListener("mousemove",e=>{cursor.style.left=e.clientX+"px";cursor.style.top=e.clientY+"px";if(Math.random()>0.3){const p=document.createElement("div");p.className="trail-particle";const s=Math.random()*10+3;const h=Math.random()>0.5?180:300;p.style.cssText="left:"+e.clientX+"px;top:"+e.clientY+"px;width:"+s+"px;height:"+s+"px;background:hsla("+h+",100%,60%,0.5);box-shadow:0 0 "+s+"px hsla("+h+",100%,60%,0.8);";trailContainer.appendChild(p);setTimeout(()=>p.remove(),800)}});
document.querySelectorAll("a,button,.portfolio-item").forEach(el=>{el.addEventListener("mouseenter",()=>cursor.classList.add("hover"));el.addEventListener("mouseleave",()=>cursor.classList.remove("hover"))});
const musicBtn=document.getElementById("musicBtn"),bgMusic=document.getElementById("bgMusic");let isPlaying=false;
musicBtn.addEventListener("click",()=>{if(isPlaying){bgMusic.pause();musicBtn.classList.remove("playing")}else{bgMusic.play().catch(()=>{});musicBtn.classList.add("playing")}isPlaying=!isPlaying});
document.body.addEventListener("click",()=>{if(!isPlaying){bgMusic.play().then(()=>{isPlaying=true;musicBtn.classList.add("playing")}).catch(()=>{})}},{once:true});
document.querySelectorAll(".portfolio-item video").forEach(v=>{v.parentElement.addEventListener("mouseenter",()=>v.play());v.parentElement.addEventListener("mouseleave",()=>v.pause())});
window.addEventListener("load",()=>{setTimeout(()=>{document.getElementById("loading").classList.add("hidden")},1500)});
document.querySelectorAll("nav a").forEach(l=>{l.addEventListener("click",e=>{e.preventDefault();document.querySelector(l.getAttribute("href")).scrollIntoView({behavior:"smooth"})})});
</script>
</body>
</html>`;
fs.writeFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\wangjiaju\\index.html', html);
console.log('Done!');
