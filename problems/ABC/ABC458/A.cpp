#include <bits/stdc++.h>
#define rep(i,n) for (int i=0; i<(n); i++)
using namespace std;

int main() {
    string S;
    int N;

    cin >> S >> N;
    int len = S.size();

    for (int i = 0; i < len; i++){
        if (i < N || i >= len - N) {
            
        } else {
            cout << S.at(i);
        }
    }
    cout << endl;
}
