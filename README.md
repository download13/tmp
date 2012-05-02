Ok, here's how it works:
Anything out on it's own in a template is printed just as it's shown.
Anything between <% and %> is treated as JavaScript code and is executed.
Anything between <%= and %> is treated as a JavaScript statement, it's value is printed.
The word between <%^ and %> is the name of another template, already loaded into the TemplateManager (no circular references), to be included in this template.
Keep in mind that it basically works like PHP, in that any plain text between <%if(test==0){%> and <%}%> will only be printed if "test" equals 0.

PS: I know `eval` is bad practice, but it was either `eval` or `with`, and guess which one is deprecated...

Don't use this. I wrote it while looking for a simple JS templating solution. Use Mustache, it's better.
===