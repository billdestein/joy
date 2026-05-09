//----------------------------------------------------------------------------------------------------
// framesTest
//----------------------------------------------------------------------------------------------------
export const framesTest = `

frames-test is a React app.  

It uses the frames library in /joy/lucy/frontend/frames.

Initially, frames-test shows an all black window with the word "Lucy" centered in the window
in color gold.  And there's a signin button in the upper right that initiates Cognito login.

Once logged in, there is row for buttons across the top of the window.  The rest of the 
vertical space is used for the canvas.

Within the canvas are two frames.

Both frames have an applet that calls the background to generate an image.
One uses the prompt, "Show me a dog".  The other uses the prompt "Show me a cat".
The image returned is shown in the applet.  While waiting for Gemini to 
generate the image, the applet shows some sort of spinner.

Both frames have a single button.  The icon is an 'x'.  The handler function calls the canvas
to remove the frame.  The tooltip label is 'close'.

The user can demonstrate that the frames are draggable, resizable, stackable and restackable.

There is a button demonstrates a simple modal frame.

`
