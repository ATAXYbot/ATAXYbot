const fs = require('fs');

let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const targetStr = `                                                )}
                                            </div>
                                        </div>
                                    )}`;

const replacementStr = `                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    )}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
console.log('Injected missing </div>');
