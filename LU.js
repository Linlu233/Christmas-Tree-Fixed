// 使用JS基本方法替代部分GSAP付费控件
var xmlns = "http://www.w3.org/2000/svg",
  xlinkns = "http://www.w3.org/1999/xlink",
  select = function (s) {
    return document.querySelector(s);
  },
  selectAll = function (s) {
    return document.querySelectorAll(s);
  },
  pContainer = select('.pContainer'),
  mainSVG = select('.mainSVG'),
  star = select('#star'),
  sparkle = select('.sparkle'),
  tree = select('#tree'),
  showParticle = true,
  particleColorArray = ['#E8F6F8', '#ACE8F8', '#F6FBFE', '#A2CBDC', '#B74551', '#5DBA72', '#910B28', '#910B28', '#446D39'],
  particleTypeArray = ['#star', '#circ', '#cross', '#heart'],
  particlePool = [],
  particleCount = 0,
  numParticles = 201;

document.querySelector('svg').style.visibility = 'visible';

// 创建闪烁效果
const flicker = (p) => {
  p.style.animation = 'flicker 0.07s infinite';
};

// 初始化粒子池
function createParticles() {
  for (let i = 0; i < numParticles; i++) {
    let p = select(particleTypeArray[i % particleTypeArray.length]).cloneNode(true);
    mainSVG.appendChild(p);
    p.setAttribute('fill', particleColorArray[i % particleColorArray.length]);
    p.setAttribute('class', "particle");
    particlePool.push(p);
    // 初始化隐藏粒子
    p.style.transformOrigin = '50% 50%';
    p.style.position = 'absolute';
    p.style.opacity = 0;
  }
}

// 让粒子从路径上生成并持续飘动
function playParticle(point) {
  let p = particlePool[particleCount];
  let scale = Math.random() * 2.5 + 0.5;
  let offsetX = (Math.random() - 0.5) * window.innerWidth; // 粒子随机偏移以达到全屏效果
  let offsetY = (Math.random() - 0.5) * window.innerHeight; // 粒子随机偏移以达到全屏效果

  p.style.transform = `translate(${point.x + offsetX}px, ${point.y + offsetY}px) scale(${scale})`;

  let duration = Math.random() * 6 + 4; // 控制飘动粒子的动画时长

  let keyframes = [
    { opacity: 1, transform: `translate(${point.x + offsetX}px, ${point.y + offsetY}px) scale(${scale})` },
    { opacity: 0, transform: `translate(${point.x + offsetX}px, ${point.y + offsetY}px) scale(0)` }
  ];

  p.animate(keyframes, {
    duration: duration * 1000,
    easing: 'ease-out',
    iterations: 1
  });

  particleCount++;
  if (particleCount >= numParticles) {
    particleCount = 0;
  }
}

// 获取SVG路径的所有点
function getSVGPoints(path) {
  let arr = [];
  let pathElement = select(path);
  let totalLength = pathElement.getTotalLength();

  for (let i = 0; i <= totalLength; i += totalLength / 150) { // 更精细的粒子步进以使粒子速度加快
    let point = pathElement.getPointAtLength(i);
    arr.push({ x: point.x, y: point.y });
  }

  return arr;
}

let treePath = getSVGPoints('.treePath');
let treeBottomPath = getSVGPoints('.treeBottomPath');

// 沿路径滑动元素
function animatePath(el, pathArray, isParticle = false, onComplete = null) {
  let stepDuration = 6; // 调整此处滑动粒子的速度，值越小速度越快，默认值为6
  let totalSteps = pathArray.length;
  let currentStep = 0;

  function step() {
    if (currentStep < totalSteps) {
      let point = pathArray[currentStep];
      el.style.transform = `translate(${point.x}px, ${point.y}px)`;
      if (isParticle) playParticle(point); // 同时触发粒子的飘动效果
      currentStep++;
      setTimeout(step, stepDuration * 1425 / totalSteps); // 控制粒子跟随路径的速度
    } else {
      // 路径完成后触发回调函数
      if (onComplete) onComplete();
    }
  }

  step();
}

// 绘制路径上的星星和粒子效果
function drawStar() {
  const treePathElement = select('.treePath');
  const firstPoint = treePathElement.getPointAtLength(0);

  // 初始化元素位置
  pContainer.style.transform = `translate(${firstPoint.x}px, ${firstPoint.y}px)`;
  sparkle.style.transform = `translate(${firstPoint.x}px, ${firstPoint.y}px)`;
  pContainer.style.opacity = 1;
  sparkle.style.opacity = 1;

  // 沿着树的路径动画
  animatePath(pContainer, treePath, true, () => {
    animatePath(pContainer, treeBottomPath, true, () => {
      // 完成所有路径后让滑动的粒子消失
      pContainer.style.opacity = 0;
      sparkle.style.opacity = 0;
    });
  });

  animatePath(sparkle, treePath, false, () => {
    animatePath(sparkle, treeBottomPath, false, () => {
      // 完成所有路径后让滑动的粒子消失
      sparkle.style.opacity = 0;
    });
  });
}

createParticles();

// 持续生成飘动的粒子
setInterval(() => {
  if (showParticle) {
    for (let i = 0; i < 3; i++) { // 每次生成三个粒子
      const randomPoint = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      };
      playParticle(randomPoint);
    }
  }
}, 300); // 每300毫秒生成一组粒子 // 每300毫秒生成一个粒子

drawStar();

// 绘制路径的描边动画
function pathDrawEffect(selector) {
  const path = select(selector);
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  let startTime = performance.now();

  function draw() {
    let elapsed = (performance.now() - startTime) / 9000; // 控制路径描边动画的时间
    path.style.strokeDashoffset = length * (1 - elapsed);
    if (elapsed < 1) {
      requestAnimationFrame(draw);
    }
  }

  draw();
}

pathDrawEffect('.treePathMask');
pathDrawEffect('.treePotMask');
pathDrawEffect('.treeStarOutline');

// 判断用户是否离开标签页
let originalTitle = document.title;
window.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    document.title = "你要离开了嘛？o>_<o";
  } else {
    document.title = "欢迎回来！圣诞快乐吖~";
    setTimeout(() => {
      document.title = originalTitle;
    }, 3000); // 3秒后恢复为原始标题
  }
});

// 检测设备是否为手机
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}
// 如果是手机访问，显示提示并禁止访问
if (isMobile()) {
  alert("请使用电脑访问");
  window.location.replace("https://521.fyi");
}
