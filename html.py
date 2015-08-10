# Specialized code just for taking in a dictionary, and optional CSS classes and returning HTML code to print that data as a table

# Code is thanks to:
# http://www.stevetrefethen.com/blog/pretty-printing-a-python-dictionary-to-html

def prettyTable(dictionary, cssClass=''):
        ''' pretty prints a dictionary into an HTML table(s) '''
        if isinstance(dictionary, str):
            return '<td>' + dictionary + '</td>'
        s = ['<table border = "2px solid black" align="center"']
        if cssClass != '':
            s.append('class="%s"' % (cssClass))
        s.append('>\n')
        for key, value in dictionary.iteritems():
            s.append('<tr>\n  <td valign="top"><strong>%s</strong></td>\n' % str(key))
            if isinstance(value, dict):
                if key == 'picture' or key == 'icon':
                    s.append('  <td valign="top"><img src="%s"></td>\n' % Page.prettyTable(value, cssClass))
                else:
                    s.append('  <td valign="top">%s</td>\n' % Page.prettyTable(value, cssClass))
            elif isinstance(value, list):
                s.append("<td><table>")
                for i in value:
                    s.append('<tr><td valign="top">%s</td></tr>\n' % Page.prettyTable(i, cssClass))
                s.append('</table>')
            else:
                if key == 'picture' or key == 'icon':
                    s.append('  <td valign="top"><img src="%s"></td>\n' % value)
                else:
                    s.append('  <td valign="top">%s</td>\n' % value)
            s.append('</tr>\n')
        s.append('</table>')
        return '\n'.join(s)

def prettyDatabase(array, cssClass=''):
        ''' pretty prints [ian array into an HTML table(s) '''
        if isinstance(array, str):
            return '<td>' + array + '</td>'
        s = ['<table border = "2px solid black" align="center"']
        if cssClass != '':
            s.append('class="%s"' % (cssClass))
        s.append('>\n')
        for row in array:
            s.append('<tr>\n')
            for item in row:
                s.append('  <td valign="top">%s</td>\n' % item)
            s.append('</tr>\n')
        s.append('</table>')
        return '\n'.join(s)

