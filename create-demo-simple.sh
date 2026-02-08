#!/bin/bash
# Create a simple demo image with screenshots

cd /home/node/.openclaw/workspace/usdc-hackathon
rm -rf demo-frames demo.gif
mkdir -p demo-frames

# Let's create simple colored gradient frames as placeholders
# and update the README to focus on code examples instead

# Create 6 frames with different colored gradients
for i in {1..6}; do
    # Create gradient from dark to lighter green
    convert -size 800x400 gradient:'#0a2a0a'-'#1a4a1a' \
            -gravity center -pointsize 48 -fill white \
            -draw "text 0,0 'Frame $i'" \
            demo-frames/frame${i}.png 2>/dev/null || {
        # Fallback: solid color frames
        convert -size 800x400 xc:"#$(printf '%02x' $((10 + i * 20)))$(printf '%02x' $((40 + i * 10)))$(printf '%02x' $((10 + i * 20)))" \
                demo-frames/frame${i}.png
    }
done

# Create animated GIF
if [ -f demo-frames/frame1.png ]; then
    convert -delay 200 demo-frames/frame*.png -loop 0 demo.gif
    echo "Demo GIF created:"
    ls -lh demo.gif
else
    echo "Failed to create frames"
    exit 1
fi
