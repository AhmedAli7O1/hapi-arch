"use strict";

const util = require( "util" );

function ArchError (settings = {}, implementationContext = ArchError, errorName = "Arch Error") {
  // Override the default name property (Error). This is basically zero value-add.
  this.name = errorName;

  this.type = ( settings.type || "Application" );
  this.message = ( settings.message || "An error occurred." );
  this.detail = ( settings.detail || "" );
  this.extendedInfo = ( settings.extendedInfo || "" );
  this.errorCode = ( settings.errorCode || "" );

  this.isAppError = true;

  /**
   * Capture the current stacktrace and store it in the property "this.stack". By
   * providing the implementationContext argument, we will remove the current
   * constructor (or the optional factory function) line-item from the stacktrace; this
   * is good because it will reduce the implementation noise in the stack property.
   */
  //
  Error.captureStackTrace(this, (implementationContext));

}

util.inherits(ArchError, Error);

function PluginLoaderError (settings) {
  // NOTE: We are overriding the "implementationContext" so that the PluginLoaderError()
  // function is not part of the resulting stacktrace.
  return new ArchError(settings, PluginLoaderError, "Plugin Error");
}

module.exports = {
  PluginLoaderError
};