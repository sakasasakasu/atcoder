#include <bits/stdc++.h>
using namespace std; 

int main() {
    int H, W;
    cin >> H >> W;
    vector<string> S(H);
    for (int i = 0; i < H; i++) {
        cin >> S.at(i);
    }
    
    int count = 0;

    for (int h1 = 0; h1 < H; h1++) {
        for (int h2 = h1; h2 < H; h2++) {
            for (int w1 = 0; w1 < W; w1++) {
                for (int w2 = w1; w2 < W; w2++) {

                    bool ans = true;
                    for (int i = h1; i <= h2; i++) {
                        for (int j = w1; j <= w2; j++) {
                            int ni = h1 + h2 - i;
                            int nj = w1 + w2 - j;
                            if (S.at(i).at(j) != S.at(ni).at(nj)) {
                                ans = false;
                                break;
                            }
                        }
                        if (!ans) break;
                    }
                    if (ans) {
                        count++;
                    }
                }
            }
        }
    }
    cout << count << endl;
}