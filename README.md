# Etc: Efficient Transfer Coding for JavaScript

[Main project page](https://github.com/superp00t/etc)

This project also contains consistent and correct helper functions that are useful on the path to building an app. 

## Example code

```js
const etc = require("etc-js");

var b = new etc.Buffer();
b.writeInt(50000);
b.writeString("test");

var u = new etc.URL("http://example.com/");
u.store("data", b);

u.toString(); // http://example.com/?data=0IYDBHRlc3Q-

var d = u.load("data");
d.readInt();  // 50000
d.readString(); // "test"
```
