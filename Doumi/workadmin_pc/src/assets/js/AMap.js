export default function MapLoader() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap);
    } else {
      var script = document.createElement("script");
      var script2 = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src =
        "https://webapi.amap.com/maps?v=1.4.15&callback=initAMap&key=e467eaddd651aca7555ab44e820468a5";
      script.onerror = reject;
      document.head.appendChild(script);
      script2.type = "text/javascript";
      script2.async = true;
      script2.src = "//webapi.amap.com/ui/1.0/main.js?v=1.0.11";
      script2.onerror = reject;
      document.head.appendChild(script2);
    }
    window.initAMap = () => {
      resolve(window.AMap);
    };
  });
}
