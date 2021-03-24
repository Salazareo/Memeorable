class meme_template_overlay {

    name = null;
    genre = null;
    tags = [];
    constructor(name, genre, tags) {
        this.name = name;
        this.genre = genre;
        this.tags = tags;
    }

    getName() {
        return this.name;
    }

    getGenre() {
        return this.genre;
    }

    getTags() {
        return this.tags;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }

    removeTag(tag){
        if(this.tags.includes(tag)){
            this.tags.filter(tag);
        }
    }

    setGenre(genre){
        this.genre = genre;
    }

    saveMeme(tid, instructions){
        if (document.getElementById("textbox0") == NULL){
            return -1;
        }
        let Alltexts = document.getElementsByClassName("textbox");
        let color = document.getElementById("textbox0").style.color;
        let size = document.getElementById("textbox0").style.fontSize

        let texts = document.getElementsByClassName("textbox");
        for (i = 0; i < texts.length; i++) {
            let textid = "textbox" + i;
            let startPos = document.getElementById(textid).selectionStart;
            let endPos = document.getElementById(textid).selectionEnd;
            // Add this to database. This textbox has these positions and the color at the top.
        }
        /* Return bit number bit_num from right in byte.

        @param list instructions: a list of tables that contain
        information about the overlay of the meme (e.g. xpos, ypos
        length, width, content, etc.)
        @rtype: ¯\_(ツ)_/¯
        */

    //    THIS SHOULD BE IN CONTROLLER
    //    json_instructions = {overlays: []};
    //    i = 0;
        
    //     for (x of instructions){
    //         obj_name = "obj"+i;
    //         json_instructions.overlays.push({"xpos": ??, "ypos": ??, "length": ??, ......});
    //         i++; 
    //     }

        var json_instructions = JSON.stringify(instructions);
        // send the json_instructions to DB

        return;
    }
}