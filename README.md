# hapi-arch

mini framework for hapijs, using rails like convention.

Models, Services, Controllers and routes, without breaking the plugins architecture hapi uses.
 so you still can benefit from the microservices design by defining every single feature in your app as a plugin.
 
 however, you don't need to deal with the server structure every time you need add/remove a plugin.
  
  you just create a plugin folder with your business logic, controllers, services, models and routes, then restart your server...then you're DONE! now you can access your new APi end-points.
  
### Usage

* generate new project.

```
# install hapi-arch globally
npm install -g hapi-arch

# generate a new app
hapi-arch generate new

# follow instructions
# go to the app directory
cd app-name
# install node dependencies
npm install
# you can start your app now by
npm start
```