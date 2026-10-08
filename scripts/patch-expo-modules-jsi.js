const fs = require('fs');
const path = require('path');

// 1. Patch RuntimeScheduler.h
const headerPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI-Cxx',
  'include',
  'RuntimeScheduler.h'
);

if (fs.existsSync(headerPath)) {
  let content = fs.readFileSync(headerPath, 'utf8');
  if (content.includes('SWIFT_RETURNS_RETAINED RuntimeScheduler')) {
    content = content.replace(/SWIFT_RETURNS_RETAINED RuntimeScheduler/g, 'RuntimeScheduler');
    fs.writeFileSync(headerPath, content, 'utf8');
    console.log('✅ Patched RuntimeScheduler.h (removed SWIFT_RETURNS_RETAINED)');
  } else {
    console.log('ℹ️ RuntimeScheduler.h already patched or clean');
  }
} else {
  console.log('⚠️ RuntimeScheduler.h not found at:', headerPath);
}

// 2. Patch JavaScriptRuntime.swift
const swiftPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'JavaScriptRuntime.swift'
);

if (fs.existsSync(swiftPath)) {
  let content = fs.readFileSync(swiftPath, 'utf8');
  let modified = false;

  // Patch getter
  const getterTarget = 'nonisolated(unsafe) let resultPtr = resultPtr';
  if (content.includes(getterTarget)) {
    content = content.replace(
      getterTarget,
      'let resultVar = NonisolatedUnsafeVar(resultPtr)'
    );
    content = content.replace(
      'try context.get(propertyName).writeJSIValue(to: resultPtr)',
      'try context.get(propertyName).writeJSIValue(to: resultVar.value)'
    );
    modified = true;
  }

  // Patch callerRunLoop
  const callerTarget = 'nonisolated(unsafe) let callerRunLoop = CFRunLoopGetCurrent()';
  if (content.includes(callerTarget)) {
    content = content.replace(
      callerTarget,
      'let callerRunLoop = NonisolatedUnsafeVar(CFRunLoopGetCurrent())'
    );
    content = content.replace(
      'CFRunLoopPerformBlock(callerRunLoop, CFRunLoopMode.commonModes.rawValue)',
      'CFRunLoopPerformBlock(callerRunLoop.value, CFRunLoopMode.commonModes.rawValue)'
    );
    content = content.replace(
      'CFRunLoopWakeUp(callerRunLoop)',
      'CFRunLoopWakeUp(callerRunLoop.value)'
    );
    modified = true;
  }

  // Patch createFunctionClosure (first overload - owning this)
  const fn1Target = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)`;

  const fn1Replace = `    let thisVar = NonisolatedUnsafeVar(thisPtr)
    let argumentsVar = NonisolatedUnsafeVar(argumentsPtr)
    let resultVar = NonisolatedUnsafeVar(resultPtr)

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisVar.value).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsVar.value, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultVar.value)`;

  if (content.includes(fn1Target.replace(/\r\n/g, '\n'))) {
    content = content.replace(fn1Target.replace(/\r\n/g, '\n'), fn1Replace.replace(/\r\n/g, '\n'));
    modified = true;
  }

  // Patch createFunctionClosure (second overload - unowned this)
  const fn2Target = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)`;

  const fn2Replace = `    let thisVar = NonisolatedUnsafeVar(thisPtr)
    let argumentsVar = NonisolatedUnsafeVar(argumentsPtr)
    let resultVar = NonisolatedUnsafeVar(resultPtr)

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsVar.value, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisVar.value)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultVar.value)`;

  if (content.includes(fn2Target.replace(/\r\n/g, '\n'))) {
    content = content.replace(fn2Target.replace(/\r\n/g, '\n'), fn2Replace.replace(/\r\n/g, '\n'));
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(swiftPath, content, 'utf8');
    console.log('✅ Patched JavaScriptRuntime.swift (wrapped pointers in NonisolatedUnsafeVar)');
  } else {
    console.log('ℹ️ JavaScriptRuntime.swift already patched or clean');
  }
} else {
  console.log('⚠️ JavaScriptRuntime.swift not found at:', swiftPath);
}
