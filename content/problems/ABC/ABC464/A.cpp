#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int E, W = 0;
    string S;
    cin >> S;
    for (char c : S) {
        if (c == 'E')
            E++;
        else
            W++;
    }
    cout << (E > W ? "East" : "West") << endl;
}
