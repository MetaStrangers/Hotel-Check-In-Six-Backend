import * as AllModules from 'src/modules';
const ModuleClasses = [];
const ControllerClasses = [];
const ApiKeyAuthControllersClasses = [];

Object.values(AllModules).forEach((exportedItem) => {
  if (typeof exportedItem === 'function') {
    if (exportedItem?.name?.endsWith('Module')) {
      ModuleClasses?.push(exportedItem);
    } else if (exportedItem?.name?.endsWith('Controller')) {
      ControllerClasses?.push(exportedItem);
    }
  }
});

export { ModuleClasses, ControllerClasses, ApiKeyAuthControllersClasses };
