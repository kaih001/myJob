function objectFactory() {
  let obj = new Object();
  Constructor = [].shift.call(arguments);
  console.log(Constructor);
  obj._proto_ = Constructor.prototype;
  const result = Constructor.apply(obj, arguments);
  return typeof result === "object" ? result : obj;
}
function Otaku(name, age) {
  this.name = name;
  this.age = age;

  this.habit = "Games";
}

Otaku.prototype.strength = 60;

Otaku.prototype.sayYourName = function () {
  console.log("I am " + this.name);
};
const f = objectFactory(Otaku, 2, 3);
