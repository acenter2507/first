'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core', 'ncy-angular-breadcrumb']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
