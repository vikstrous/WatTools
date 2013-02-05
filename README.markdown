#Waterloo Tools

##About

This is a wesite which manages a collection of tools for 
University of Waterloo students
made by other students. Any edits are welcome! Drag to change
the order! Edits will be reviewed by an admin and then accepted 
and made active. At any time anyone can view all 
the submitted revisions by clicking on the Revisions button.

##Steal my code!

If you are not a Waterloo student, you are free to use 
this code for your own school!
It's really easy. It will (probably) run on any server with PHP 5.
Just please contribute back any enhancements that you make :)

###Set up
- run ./set\_password.sh \<password\>
- Make sure there is a directory called `data` with write permissions
- Make sure your web server has permission to create a file called `rss.xml` in the root folder.
- If you want to build the documnetation, you need to install node.js, Pygents and docco, then run ./build\_doc.sh

##Contribute

If you would like to contribute to this project, you can take on 
one of the following tasks:

- Make me a logo :D
- Make things look better
- Make it possible for an admin to delete a revision.
- Set up something to track clicks and maybe sort links by popularity
- extract common parts of the field and entry editor out
- transform the entry data to use a Data array instead of a hashmap of name to datum; sort the data differently than right now


##Disclaimer

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
